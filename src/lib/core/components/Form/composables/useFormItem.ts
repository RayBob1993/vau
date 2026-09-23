import type { Maybe, MaybeNull } from '../../../types';
import type { FormRootContext, FormItemProps, FormModelValues, FormItemInstance, FormModel, FormRules } from '../types';
import { useFormField } from './useFormField';
import { useFormItemValidation } from './useFormItemValidation';
import { isRuleRequired } from '../utils';
import { useToggle } from '../../../composables';
import { debounce, isEqual } from '../../../utils';
import { z, type ZodType } from 'zod';
import { computed, type MaybeRefOrGetter, onMounted, onUnmounted, toValue, useId, watch } from 'vue';

export interface UseFormItemOptions {
  formRootContext: MaybeNull<FormRootContext>;
  props: MaybeRefOrGetter<FormItemProps>;
  el?: MaybeRefOrGetter<MaybeNull<HTMLElement>>;
  onValid?: VoidFunction;
  onInvalid?: VoidFunction;
}

export function useFormItem (options: UseFormItemOptions) {
  const id = useId();

  const { isFieldDisabled, registerField } = useFormField();

  const [isDirty, setIsDirty] = useToggle(false);

  const props = computed<FormItemProps>(() => toValue(options.props));

  const name = computed<Maybe<string>>(() => props.value.name);

  const modelValue = computed<Maybe<FormModel>>(() => options.formRootContext?.modelValue.value);

  const rules = computed<Maybe<FormRules<FormModel>>>(() => options.formRootContext?.props?.rules);

  const value = computed<FormModelValues>(() => {
    if (!name.value || !modelValue.value) {
      return undefined;
    }

    return modelValue.value[name.value];
  });

  const initialValue = computed<FormModelValues>(() => {
    if (!name.value) {
      return undefined;
    }

    const initial = options.formRootContext?.initialModel.value;

    if (!initial) {
      return undefined;
    }

    return initial[name.value];
  });

  /**
   * Disabled формы, FormItem или всех зарегистрированных контролов (например VInput disabled).
   */
  const isDisabled = computed<boolean>(() => {
    return Boolean(
      options.formRootContext?.props.disabled ||
      props.value.disabled ||
      isFieldDisabled.value
    );
  });

  const rule = computed<MaybeNull<ZodType>>(() => {
    if (!name.value || !rules.value) {
      return null;
    }

    const ruleValue = rules.value[name.value];

    return ruleValue instanceof z.ZodType ? ruleValue : null;
  });

  const {
    isFieldValid,
    validationStatus,
    validationErrors,
    clearValidateErrors: clearFieldValidateErrors,
    validate: validateField
  } = useFormItemValidation({
    data: () => {
      if (!name.value) {
        return null;
      }

      return ({
        [name.value]: value.value
      });
    },
    schema: () => {
      if (!name.value || !rule.value) {
        return null;
      }

      return z.object({
        [name.value]: rule.value
      });
    },
    onValid: () => {
      options.onValid?.();
    },
    onInvalid: () => {
      options.onInvalid?.();
    }
  });

  const isValidatable = computed<boolean>(() => Boolean(rule.value) && !isDisabled.value);

  const isRequired = computed<boolean>(() => {
    if (!rule.value || isDisabled.value) {
      return false;
    }

    return isRuleRequired(rule.value);
  });

  const isPristine = computed<boolean>(() => !isDirty.value);

  const isChanged = computed<boolean>(() => {
    if (!name.value) {
      return false;
    }

    return !isEqual(value.value, initialValue.value);
  });

  const isValid = computed<boolean>(() => {
    if (!isValidatable.value) {
      return true;
    }

    return isFieldValid.value;
  });

  /**
   * Невалидируемое поле (disabled, без `name` или без rule) не участвует в валидации
   * и не блокирует форму — результат `true`, как и `isValid`.
   */
  async function validate (silent = false): Promise<boolean> {
    if (!isValidatable.value) {
      return true;
    }

    return validateField(silent);
  }

  function resetMeta () {
    setIsDirty(false);
  }

  const debouncedValidate = debounce(() => {
    if (!isValidatable.value) {
      return;
    }

    void validate();
  }, 300);

  /** Тихий parse — обновить isFieldValid без показа ошибок (для isValid кнопки). */
  function validateSilent () {
    if (!isValidatable.value) {
      return;
    }

    void validate(true);
  }

  /**
   * Очистить UI-статус и ошибки поля. `isFieldValid` не сбрасывается,
   * а пересчитывается silent-parse — форма не становится невалидной на валидных данных.
   */
  function clearValidateErrors () {
    /* Только отложенный вызов: cancel() без upcomingOnly отключил бы debounce навсегда. */
    debouncedValidate.cancel({
      upcomingOnly: true
    });

    clearFieldValidateErrors();
    validateSilent();
  }

  /**
   * Стабильный handle в реестре формы: геттеры читают актуальные ref
   */
  const instance: FormItemInstance = {
    id,
    get props () {
      return props.value;
    },
    get isValidatable () {
      return isValidatable.value;
    },
    get isFieldValid () {
      return isFieldValid.value;
    },
    get isValid () {
      return isValid.value;
    },
    get isRequired () {
      return isRequired.value;
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
    get validationStatus () {
      return validationStatus.value;
    },
    get el () {
      return toValue(options.el) ?? null;
    },
    validate,
    resetMeta,
    clearValidateErrors
  };

  onMounted(() => {
    options.formRootContext?.registerFormItem(instance);

    validateSilent();
  });

  onUnmounted(() => {
    debouncedValidate.cancel();
    options.formRootContext?.unregisterFormItem(id);
  });

  watch(value, () => {
    /* Form.reset(): значение вернула форма, а не пользователь — только пересчёт isFieldValid. */
    if (options.formRootContext?.isResetting.value) {
      validateSilent();

      return;
    }

    if (name.value) {
      setIsDirty(true);
    }

    if (!isValidatable.value) {
      return;
    }

    debouncedValidate();
  }, {
    deep: true
  });

  watch(isValidatable, (validatable, wasValidatable) => {
    if (validatable && !wasValidatable) {
      validateSilent();

      return;
    }

    if (!validatable) {
      clearValidateErrors();
    }
  });

  /**
   * Смена Zod-схемы (например rules в computed): пересчитать isFieldValid.
   * Если UI уже показывает вердикт (ошибка или успех) — обновить его громко,
   * чтобы статус не устарел; иначе только silent для кнопки.
   */
  watch(rule, (newRule, oldRule) => {
    if (newRule === oldRule || !isValidatable.value) {
      return;
    }

    const { isError, isSuccess } = validationStatus.value;

    if (isError || isSuccess) {
      void validate();

      return;
    }

    validateSilent();
  });

  return {
    isFieldValid,
    isValidatable,
    isValid,
    isDirty,
    isPristine,
    isChanged,
    validationErrors,
    validationStatus,
    isDisabled,
    isRequired,
    resetMeta,
    validate,
    clearValidateErrors,
    registerField
  };
}
