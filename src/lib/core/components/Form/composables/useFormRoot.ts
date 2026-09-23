import type { FormItemInstance, FormModel } from '../types';
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
  scrollToError?: MaybeRefOrGetter<Maybe<boolean | ScrollIntoViewOptions>>;
  onValid?: VoidFunction;
  onInvalid?: VoidFunction;
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

  /**
   * Класс form--invalid: не зеркало !isValid до готовности реестра
   * (иначе вспышка «ошибки» при mount, когда isValid ещё false).
   */
  const showAsInvalid = computed<boolean>(() => isRegistryReady.value && !isValid.value);

  const isDirty = computed<boolean>(() => namedFormItems.value.some(item => item.isDirty));

  const isPristine = computed<boolean>(() => namedFormItems.value.every(item => item.isPristine));

  const isChanged = computed<boolean>(() => namedFormItems.value.some(item => item.isChanged));

  /** Хотя бы одно поле в процессе validate. */
  const isValidating = computed<boolean>(() => formItems.value.some(item => item.isValidating));

  /** Валидна, отличается от initial и не в процессе validate. */
  const canSubmit = computed<boolean>(() => isValid.value && isChanged.value && !isValidating.value);

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
   * Восстанавливает model из снимка на mount и сбрасывает статусы валидации / meta.
   *
   * После смены model `watch(value)` у FormItem ставит debounce validate и isDirty —
   * поэтому clear/meta делаем повторно в nextTick.
   */
  function reset () {
    captureInitialModel();

    if (initialModel.value) {
      options.onUpdateModelValue(clone(initialModel.value));
    }

    clearValidate();
    resetMeta();

    void nextTick(async () => {
      clearValidate();
      resetMeta();
      await validateForm(true);
    });
  }

  /**
   * Запускает валидацию всех валидируемых FormItem.
   * Обновляет `isFieldValid` у каждого поля (и тем самым агрегированный `isValid`).
   *
   * @param silent - Если `true`, ошибки в UI не показываются (`isError` / issues не выставляются),
   *   но логический результат поля всё равно обновляется. Если `false` (по умолчанию) —
   *   при ошибке выводятся сообщения и статус `isError`, при успехе — `isSuccess`.
   * @returns `true`, если все валидируемые поля прошли проверку; `false` — иначе
   *   (в т.ч. если прогон устарел из‑за `takeLatest`).
   */
  async function validate (silent = false): Promise<boolean> {
    const result = await validateForm(silent);

    if (result === undefined) {
      return false;
    }

    if (!silent && !result) {
      await nextTick();
      scrollToFirstError();
    }

    return result;
  }

  onMounted(async () => {
    await nextTick();

    captureInitialModel();

    /* FormItem к этому моменту зарегистрированы и сами делают silent-parse. */
    setIsRegistryReady(true);
  });

  return {
    isValid,
    showAsInvalid,
    isDirty,
    isPristine,
    isChanged,
    isValidating,
    canSubmit,
    validate,
    clearValidate,
    registerFormItem,
    unregisterFormItem,
    initialModel: readonly(initialModel),
    reset
  };
}
