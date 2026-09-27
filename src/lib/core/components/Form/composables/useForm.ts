import type {
  FormController,
  FormControllerInternal,
  FormField,
  FormFieldName,
  FormItemError,
  FormItemInstance,
  FormItemValidationStatus,
  FormModel,
  FormModelValidationResult,
  FormRootValidationResult,
  FormRules,
  FormSubmitEvent
} from '../types';
import type { Maybe, MaybeNull } from '../../../types';
import { useFormItems } from './useFormItems';
import { useFormValidation } from './useFormValidation';
import { useFormRootScrollError } from './useFormRootScrollError';
import { createRuleExceptionIssue, isRuleRequired } from '../utils';
import { useToggle } from '../../../composables';
import { clone, isEqual, takeLatest } from '../../../utils';
import { z, type ZodType } from 'zod';
import {
  computed,
  isRef,
  markRaw,
  nextTick,
  getCurrentScope,
  onScopeDispose,
  ref,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref
} from 'vue';

export interface UseFormOptions<MODEL extends FormModel> {
  /**
   * Модель формы. `Ref` — общий с вызывающим кодом; объект — начальное значение,
   * контроллер оборачивает его в `ref`.
   */
  model: Ref<MODEL> | MODEL;
  /** Правила Zod по ключам model (`defineFormRules`); для динамических — `computed` / getter. */
  rules?: MaybeRefOrGetter<Maybe<FormRules<MODEL>>>;
  disabled?: MaybeRefOrGetter<Maybe<boolean>>;
  /**
   * После неуспешной громкой валидации — скролл к первому ошибочному FormItem.
   * `true` — `FORM_SCROLL_INTO_VIEW_OPTIONS`; объект дополняет эти значения.
   */
  scrollToError?: MaybeRefOrGetter<Maybe<boolean | ScrollIntoViewOptions>>;
  /** Submit формы (нативный или `form.submit()`) после громкой валидации. */
  onSubmit?: (payload: FormSubmitEvent) => void;
  /** Форма прошла громкую валидацию; silent-прогоны не вызывают. */
  onValid?: VoidFunction;
  /** Форма не прошла громкую валидацию; silent-прогоны не вызывают. */
  onInvalid?: VoidFunction;
}

const NEUTRAL_VALIDATION_STATUS: FormItemValidationStatus = {
  isError: false,
  isValidating: false,
  isSuccess: false
};

/**
 * Контроллер формы: model, rules, состояние и действия.
 * Работает без UI: `isValid` / `canSubmit` считаются по model и rules.
 * `Form.Root` / `Form.Item` — только отображение и ввод.
 *
 * @example
 * const form = useForm({
 *   model: { email: '' },
 *   rules: defineFormRules<Model>({ email: z.email() }),
 *   onSubmit: ({ isValid }) => { ... }
 * });
 *
 * form.model.email = 'a@b.c';
 * form.canSubmit;
 *
 * <Form.Root :form="form">
 *   <Form.Item :field="form.field('email')">
 *     <Input.Root v-model="form.model.email" />
 *   </Form.Item>
 * </Form.Root>
 */
export function useForm <MODEL extends FormModel> (options: UseFormOptions<MODEL>): FormController<MODEL> {
  const model: Ref<MODEL> = isRef(options.model)
    ? options.model
    : ref(options.model) as Ref<MODEL>;

  const rules = computed<Maybe<FormRules<MODEL>>>(() => toValue(options.rules));

  const isDisabled = computed<boolean>(() => Boolean(toValue(options.disabled)));

  const { formItems, registerFormItem, unregisterFormItem } = useFormItems();

  const { validate: validateItems, clearValidate, validatableFormItems } = useFormValidation({
    formItems: () => formItems.value
  });

  const { scrollToFirstError } = useFormRootScrollError({
    scrollToError: () => toValue(options.scrollToError),
    formItems: () => validatableFormItems.value
  });

  /** Снимок model при создании контроллера — эталон для reset() и isChanged. */
  const initialModel = shallowRef<MODEL>(clone(model.value));

  let lastSeenModel = clone(model.value);

  /**
   * `Form.Root` в DOM. Нужен для скролла к ошибке и классов хоста, не для isValid.
   */
  const [isBound, setIsBound] = useToggle();

  const [isResetting, setIsResetting] = useToggle();

  const [isDirty, setIsDirty] = useToggle();

  const [isModelValid, setIsModelValid] = useToggle(false);

  const [isModelValidating, setIsModelValidating] = useToggle();

  const modelErrors = shallowRef<Partial<Record<FormFieldName<MODEL>, Array<FormItemError>>>>({});

  const dirtyFields = shallowRef(new Set<string>());

  const isPristine = computed<boolean>(() => !isDirty.value);

  const isChanged = computed<boolean>(() => !isEqual(model.value, initialModel.value));

  const isValid = computed<boolean>(() => isModelValid.value);

  const hasErrors = computed<boolean>(() => validatableFormItems.value.some(item => item.validationStatus.isError));

  const isValidating = computed<boolean>(() => {
    return isModelValidating.value || validatableFormItems.value.some(item => item.validationStatus.isValidating);
  });

  const canSubmit = computed<boolean>(() => {
    if (isDisabled.value) {
      return false;
    }

    return isValid.value && isChanged.value && !isValidating.value;
  });

  function getFormItem (name: string): MaybeNull<FormItemInstance> {
    return formItems.value.find(item => item.name === name) ?? null;
  }

  function getRule (name: string): MaybeNull<ZodType> {
    const ruleValue = rules.value?.[name];

    return ruleValue instanceof z.ZodType ? ruleValue : null;
  }

  function markFieldsDirty (previous: MODEL, next: MODEL) {
    const keys = new Set([...Object.keys(previous), ...Object.keys(next)]);
    const dirty = new Set(dirtyFields.value);

    keys.forEach(key => {
      if (!isEqual(previous[key], next[key])) {
        dirty.add(key);
      }
    });

    dirtyFields.value = dirty;
  }

  function clearDirtyFields () {
    dirtyFields.value = new Set();
  }

  function resetMeta () {
    clearDirtyFields();
    formItems.value.forEach(item => {
      item.resetMeta();
    });
  }

  /**
   * Схема всей model из `rules`. Не-Zod значения игнорируются.
   */
  function buildModelSchema (): MaybeNull<z.ZodObject> {
    if (!rules.value) {
      return null;
    }

    const shape: Record<string, ZodType> = {};

    Object.entries(rules.value).forEach(([key, ruleValue]) => {
      if (ruleValue instanceof z.ZodType) {
        shape[key] = ruleValue;
      }
    });

    if (Object.keys(shape).length === 0) {
      return null;
    }

    return z.object(shape);
  }

  function collectModelErrors (issues: Array<FormItemError>): Partial<Record<FormFieldName<MODEL>, Array<FormItemError>>> {
    const errors: Partial<Record<FormFieldName<MODEL>, Array<FormItemError>>> = {};

    issues.forEach(issue => {
      const key = issue.path[0];

      if (typeof key !== 'string') {
        return;
      }

      const fieldName = key as FormFieldName<MODEL>;

      errors[fieldName] = [...(errors[fieldName] ?? []), issue];
    });

    return errors;
  }

  function applyModelResult (result: FormModelValidationResult<MODEL>) {
    setIsModelValid(result.isValid);
    modelErrors.value = result.errors;
  }

  const parseModelLatest = takeLatest(async (): Promise<FormModelValidationResult<MODEL>> => {
    const schema = buildModelSchema();

    if (!schema) {
      return {
        isValid: true,
        errors: {}
      };
    }

    try {
      const parsed = await schema.safeParseAsync(model.value);

      if (parsed.success) {
        return {
          isValid: true,
          errors: {}
        };
      }

      return {
        isValid: false,
        errors: collectModelErrors(parsed.error.issues)
      };
    } catch (error) {
      console.error('[vau Form] Исключение в правиле формы:', error);

      return {
        isValid: false,
        errors: collectModelErrors([createRuleExceptionIssue(model.value)])
      };
    }
  });

  /**
   * Тихий прогон схемы: обновляет `isValid` и ошибки полей. Без UI.
   */
  async function syncValidity (): Promise<{ result: FormModelValidationResult<MODEL>; isLatest: boolean; }> {
    setIsModelValidating(true);

    const { value: result, isLatest } = await parseModelLatest();

    if (!isLatest) {
      if (!parseModelLatest.isPending()) {
        setIsModelValidating(false);
      }

      return {
        result,
        isLatest
      };
    }

    setIsModelValidating(false);
    applyModelResult(result);

    return {
      result,
      isLatest
    };
  }

  /**
   * Восстанавливает model из снимка initial и сбрасывает статусы валидации / meta.
   */
  function reset () {
    setIsResetting(true);
    setIsDirty(false);
    resetMeta();

    model.value = clone(initialModel.value);
    lastSeenModel = clone(initialModel.value);

    clearValidate();

    void nextTick(() => {
      setIsResetting(false);
    });
  }

  /**
   * Принять текущую model как новый initial.
   */
  function commit () {
    initialModel.value = clone(model.value);
    lastSeenModel = clone(model.value);
    setIsDirty(false);
    resetMeta();
    clearValidate();
  }

  /**
   * Прогон схемы + опционально UI смонтированных полей.
   */
  async function runValidation (silent: boolean): Promise<FormRootValidationResult> {
    const [modelSync, itemsResult] = await Promise.all([
      syncValidity(),
      validateItems(silent)
    ]);

    const { result, isLatest: modelLatest } = modelSync;
    const isLatest = modelLatest && itemsResult.isLatest;

    if (isLatest && !silent) {
      if (result.isValid) {
        options.onValid?.();
      } else {
        options.onInvalid?.();
        await nextTick();
        scrollToFirstError();
      }
    }

    return {
      isValid: result.isValid,
      isLatest
    };
  }

  /**
   * Валидация всей model по `rules`. Смонтированные FormItem обновляют UI
   * (`silent: false` — ошибки, `true` — только логический статус поля).
   */
  async function validate (silent = false): Promise<boolean> {
    const { isValid: result } = await runValidation(silent);

    return result;
  }

  async function validateModel (silent = false): Promise<FormModelValidationResult<MODEL>> {
    if (!silent) {
      await validate(false);
    } else {
      await syncValidity();
    }

    return {
      isValid: isModelValid.value,
      errors: modelErrors.value
    };
  }

  async function submit () {
    const { isValid: result, isLatest } = await runValidation(false);

    if (!isLatest) {
      return;
    }

    options.onSubmit?.({
      isValid: result,
      reset,
      commit
    });
  }

  const fields = new Map<string, FormField<MODEL, FormFieldName<MODEL>>>();

  function field <NAME extends FormFieldName<MODEL>> (name: NAME): FormField<MODEL, NAME> {
    const cached = fields.get(name);

    if (cached) {
      return cached as FormField<MODEL, NAME>;
    }

    const created: FormField<MODEL, NAME> = markRaw({
      name,
      get isMounted () {
        return Boolean(getFormItem(name));
      },
      get isValidatable () {
        const item = getFormItem(name);

        if (item) {
          return item.isValidatable;
        }

        return Boolean(getRule(name)) && !isDisabled.value;
      },
      get isFieldValid () {
        const item = getFormItem(name);

        if (item) {
          return item.isFieldValid;
        }

        if (!getRule(name)) {
          return true;
        }

        return !modelErrors.value[name]?.length;
      },
      get isValid () {
        const item = getFormItem(name);

        if (item && !item.isValidatable) {
          return true;
        }

        if (!getRule(name) || isDisabled.value) {
          return true;
        }

        return !modelErrors.value[name]?.length;
      },
      get isRequired () {
        const item = getFormItem(name);

        if (item) {
          return item.isRequired;
        }

        const rule = getRule(name);

        if (!rule || isDisabled.value) {
          return false;
        }

        return isRuleRequired(rule);
      },
      get isDirty () {
        return getFormItem(name)?.isDirty ?? dirtyFields.value.has(name);
      },
      get isPristine () {
        return !created.isDirty;
      },
      get isChanged () {
        return !isEqual(model.value[name], initialModel.value[name]);
      },
      get validationStatus () {
        return getFormItem(name)?.validationStatus ?? NEUTRAL_VALIDATION_STATUS;
      },
      validate: (silent?: boolean) => {
        const item = getFormItem(name);

        if (item) {
          return item.validate(silent);
        }

        const rule = getRule(name);

        if (!rule) {
          return Promise.resolve(true);
        }

        return z.object({
          [name]: rule
        }).safeParseAsync({
          [name]: model.value[name]
        }).then(parsed => parsed.success);
      },
      clearValidateErrors: () => {
        getFormItem(name)?.clearValidateErrors();
      }
    });

    fields.set(name, created);

    return created;
  }

  function registerForm () {
    if (import.meta.env.DEV && isBound.value) {
      console.warn('[vau Form] Контроллер уже привязан к другой Form.Root. Один контроллер — одна смонтированная форма.');
    }

    setIsBound(true);
  }

  function unregisterForm () {
    setIsBound(false);
  }

  watch(model, () => {
    const next = model.value;

    if (isResetting.value) {
      lastSeenModel = clone(next);
      void syncValidity();

      return;
    }

    markFieldsDirty(lastSeenModel, next);
    lastSeenModel = clone(next);
    setIsDirty(true);
    void syncValidity();
  }, {
    deep: true
  });

  watch(rules, () => {
    void syncValidity();
  });

  void syncValidity();

  if (getCurrentScope()) {
    onScopeDispose(() => {
      parseModelLatest.cancel();
    });
  }

  const controller: FormControllerInternal<MODEL> = markRaw({
    get model () {
      return model.value;
    },
    set model (value: MODEL) {
      model.value = value;
    },
    get rules () {
      return rules.value;
    },
    get isDisabled () {
      return isDisabled.value;
    },
    get initialModel () {
      return initialModel.value;
    },
    get isResetting () {
      return isResetting.value;
    },
    get isBound () {
      return isBound.value;
    },
    get isValid () {
      return isValid.value;
    },
    get hasErrors () {
      return hasErrors.value;
    },
    get isDirty () {
      return isDirty.value;
    },
    get isPristine () {
      return isPristine.value;
    },
    get isChanged () {
      return isChanged.value;
    },
    get isValidating () {
      return isValidating.value;
    },
    get canSubmit () {
      return canSubmit.value;
    },
    field,
    validate,
    validateModel,
    submit,
    clearValidate,
    reset,
    commit,
    registerFormItem,
    unregisterFormItem,
    getFormItem,
    registerForm,
    unregisterForm
  });

  return controller;
}
