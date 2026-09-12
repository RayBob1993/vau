import type { FormModel } from '../types';
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
   * Снимок model на момент готовности формы — эталон для reset().
   */
  const initialModel = shallowRef<MODEL>();

  function captureInitialModel () {
    if (initialModel.value) {
      return;
    }

    initialModel.value = clone(toValue(options.modelValue));
  }

  /**
   * После mount + nextTick дети успевают зарегистрироваться.
   * До этого isValid = false, чтобы кнопка не мигала enabled.
   */
  const [isRegistryReady, setIsRegistryReady] = useToggle();

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
   * Восстанавливает model из снимка на mount и сбрасывает статусы валидации.
   *
   * После смены model `watch(value)` у FormItem ставит debounce validate —
   * поэтому clear делаем повторно в nextTick (отменяет этот debounce) и
   * тихо синхронизируем isFieldValid без показа ошибок.
   */
  function reset () {
    captureInitialModel();

    if (initialModel.value) {
      options.onUpdateModelValue(clone(initialModel.value));
    }

    clearValidate();

    void nextTick(async () => {
      clearValidate();
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
    validate,
    clearValidate,
    registerFormItem,
    unregisterFormItem,
    initialModel: readonly(initialModel),
    reset
  };
}
