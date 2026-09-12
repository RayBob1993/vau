import type { Maybe } from '../../../types';
import { useFormItems } from './useFormItems';
import { useFormValidation } from './useFormValidation';
import { useFormRootScrollError } from './useFormRootScrollError';
import { useToggle } from '../../../composables';
import { computed, nextTick, onMounted, type MaybeRefOrGetter } from 'vue';

export interface UseFormRootOptions {
  scrollToError?: MaybeRefOrGetter<Maybe<boolean | ScrollIntoViewOptions>>;
  onValid?: VoidFunction;
  onInvalid?: VoidFunction;
}

export function useFormRoot (options: UseFormRootOptions = {}) {
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
    validatableFormItems
  });

  /**
   * После mount + nextTick дети успевают зарегистрироваться.
   * До этого isValid = false, чтобы кнопка не мигала enabled.
   */
  const [isRegistryReady, setIsRegistryReady] = useToggle(false);

  /**
   * isValid — агрегат логических статусов FormItem (`isFieldValid`),
   * а не отдельный silent-прогон Zod на уровне формы.
   */
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

  function reset () {
    formItems.value.forEach(formItem => formItem.reset());

    clearValidate();
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

    /* FormItem к этому моменту зарегистрированы и сами делают silent-parse. */
    setIsRegistryReady(true);
  });

  return {
    isValid,
    validate,
    clearValidate,
    registerFormItem,
    unregisterFormItem,
    reset
  };
}
