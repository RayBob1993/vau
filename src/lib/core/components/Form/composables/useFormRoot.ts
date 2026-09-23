import type { FormItemInstance, FormModel, FormRootValidationResult, FormSubmitEvent } from '../types';
import type { Maybe } from '../../../types';
import { useFormItems } from './useFormItems';
import { useFormValidation } from './useFormValidation';
import { useFormRootScrollError } from './useFormRootScrollError';
import { useToggle } from '../../../composables';
import { clone } from '../../../utils';
import { computed, nextTick, onMounted, readonly, shallowRef, toValue, type MaybeRefOrGetter } from 'vue';

export interface UseFormRootOptions <MODEL extends FormModel> {
  modelValue: MaybeRefOrGetter<MODEL>;
  onUpdateModelValue: (value: MODEL) => void;
  disabled?: MaybeRefOrGetter<Maybe<boolean>>;
  scrollToError?: MaybeRefOrGetter<Maybe<boolean | ScrollIntoViewOptions>>;
  onValid?: VoidFunction;
  onInvalid?: VoidFunction;
  onSubmit?: (payload: FormSubmitEvent) => void;
}

export function useFormRoot <MODEL extends FormModel> (options: UseFormRootOptions<MODEL>) {
  const { formItems, registerFormItem, unregisterFormItem } = useFormItems();
  const { validate: validateForm, clearValidate, validatableFormItems } = useFormValidation({
    formItems: () => formItems.value,
    onValid: () => {
      options.onValid?.();
    },
    onInvalid: () => {
      options.onInvalid?.();
    }
  });

  const { scrollToFirstError } = useFormRootScrollError({
    scrollToError: options.scrollToError,
    formItems: () => validatableFormItems.value
  });

  /**
   * Снимок model на момент готовности формы — эталон для reset() и isChanged.
   */
  const initialModel = shallowRef<MODEL>();

  /**
   * После mount + nextTick дети успевают зарегистрироваться.
   * До этого isValid = false, чтобы кнопка не мигала enabled.
   */
  const [isRegistryReady, setIsRegistryReady] = useToggle();

  /**
   * Идёт reset(): FormItem не ставит isDirty и debounce на приход initial-значения.
   */
  const [isResetting, setIsResetting] = useToggle();

  const namedFormItems = computed<Array<FormItemInstance>>(() => formItems.value.filter(item => Boolean(item.props.name)));

  const isValid = computed<boolean>(() => {
    if (!isRegistryReady.value) {
      return false;
    }

    const items = validatableFormItems.value;

    if (items.length === 0) {
      return true;
    }

    return items.every(item => item.isFieldValid);
  });

  const hasErrors = computed<boolean>(() => validatableFormItems.value.some(item => item.validationStatus.isError));

  const isDirty = computed<boolean>(() => namedFormItems.value.some(item => item.isDirty));

  const isPristine = computed<boolean>(() => namedFormItems.value.every(item => item.isPristine));

  const isChanged = computed<boolean>(() => namedFormItems.value.some(item => item.isChanged));

  const isValidating = computed<boolean>(() => validatableFormItems.value.some(item => item.validationStatus.isValidating));

  const isDisabled = computed<boolean>(() => Boolean(toValue(options.disabled)));

  const canSubmit = computed<boolean>(() => {
    if (isDisabled.value) {
      return false;
    }

    return isValid.value && isChanged.value && !isValidating.value;
  });

  function captureInitialModel () {
    if (initialModel.value) {
      return;
    }

    initialModel.value = clone(toValue(options.modelValue));
  }

  function resetMeta () {
    formItems.value.forEach(item => {
      item.resetMeta();
    });
  }

  /**
   * Восстанавливает model из снимка initial и сбрасывает статусы валидации / meta.
   *
   * Пока `isResetting`, FormItem на смену value не ставит isDirty и debounce,
   * а только пересчитывает `isFieldValid`. Флаг снимается в nextTick —
   * рассчитано на синхронный `v-model` у родителя.
   */
  function reset () {
    captureInitialModel();
    setIsResetting(true);

    if (initialModel.value) {
      options.onUpdateModelValue(clone(initialModel.value));
    }

    clearValidate();
    resetMeta();

    void nextTick(() => {
      setIsResetting(false);
    });
  }

  /**
   * Принять текущую model как новый initial: `isChanged` → false, `isDirty` сброшен,
   * UI-статусы валидации очищены. Вызывать после успешного сохранения
   * или после асинхронной загрузки данных в model.
   */
  function commit () {
    initialModel.value = clone(toValue(options.modelValue));

    clearValidate();
    resetMeta();
  }

  /**
   * Прогон валидации с признаком актуальности. Скролл к ошибке — только у актуального громкого прогона.
   */
  async function runValidation (silent: boolean): Promise<FormRootValidationResult> {
    const result = await validateForm(silent);

    if (result.isLatest && !silent && !result.isValid) {
      await nextTick();
      scrollToFirstError();
    }

    return result;
  }

  /**
   * Запускает валидацию всех валидируемых FormItem.
   * Обновляет `isFieldValid` у каждого поля (и тем самым агрегированный `isValid`).
   *
   * @param silent - Если `true`, ошибки в UI не показываются (`isError` / issues не выставляются),
   *   но логический результат поля всё равно обновляется. Если `false` (по умолчанию) —
   *   при ошибке выводятся сообщения и статус `isError`, при успехе — `isSuccess`.
   * @returns Честный результат этого прогона: `true`, если все валидируемые поля прошли проверку.
   *   Если во время прогона стартовал более новый validate, UI и события применяет только он.
   */
  async function validate (silent = false): Promise<boolean> {
    const { isValid } = await runValidation(silent);

    return isValid;
  }

  /**
   * Submit формы: громкая валидация и событие `submit`.
   * Повторный submit во время прогона делает предыдущий устаревшим — событие
   * получает только последний, без ложного `isValid: false`.
   */
  async function submit () {
    const { isValid, isLatest } = await runValidation(false);

    if (!isLatest) {
      return;
    }

    options.onSubmit?.({
      isValid,
      reset,
      commit
    });
  }

  onMounted(async () => {
    await nextTick();

    captureInitialModel();

    /* FormItem к этому моменту зарегистрированы и сами делают silent-parse. */
    setIsRegistryReady(true);
  });

  return {
    isValid,
    hasErrors,
    isDirty,
    isPristine,
    isChanged,
    isValidating,
    canSubmit,
    validate,
    submit,
    clearValidate,
    registerFormItem,
    unregisterFormItem,
    initialModel: readonly(initialModel),
    isResetting: readonly(isResetting),
    reset,
    commit
  };
}
