import type { FormModel } from '../types';
import { useFormItems } from './useFormItems';
import { useFormValidation } from './useFormValidation';
import { useToggle } from '../../../composables';
import { debounce } from '../../../utils';
import { type MaybeRefOrGetter, nextTick, onMounted, onScopeDispose, ref, toValue, watch } from 'vue';

export interface UseFormRootOptions <MODEL extends FormModel> {
  modelValue: MaybeRefOrGetter<MODEL>;
  onValid?: VoidFunction;
  onInvalid?: VoidFunction;
}

export function useFormRoot <MODEL extends FormModel> (options: UseFormRootOptions<MODEL>) {
  const { formItems, registerFormItem, unregisterFormItem } = useFormItems();
  const { validate, clearValidate, validatableFormItems } = useFormValidation({
    formItems: () => formItems.value,
    onValid: () => {
      options.onValid?.();
    },
    onInvalid: () => {
      options.onInvalid?.();
    }
  });

  const [isValid, setIsValid] = useToggle(false);

  /** Были ли хотя бы раз зарегистрированы валидируемые поля (нужно для корректного isValid при пустом списке после v-if). */
  const hadValidatableItems = ref(false);

  /** Строка id полей при последнем запуске watch; сравнение предотвращает цикл при обновлении validationStatus. */
  const lastValidatableItemIds = ref<string>('');

  function reset () {
    formItems.value.forEach(formItem => formItem.reset());

    clearValidate();
  }

  /**
   * Реакция на изменение списка валидируемых полей (добавление/удаление через v-if).
   * При появлении полей — тихая валидация и обновление isValid; при пустом списке — true только если поля уже были (hadValidatableItems).
   */
  watch(validatableFormItems, async formItems => {
    const currentIds = formItems.map(item => item.id).sort().join(',');

    if (currentIds === lastValidatableItemIds.value) {
      return;
    }

    /* Иначе после validate → validationStatus → instance → registerFormItem → formItems цикл бы повторялся. */
    lastValidatableItemIds.value = currentIds;

    if (formItems.length === 0) {
      if (hadValidatableItems.value) {
        setIsValid(true);
      }

      return;
    }

    hadValidatableItems.value = true;

    const result = await validate(true);

    if (result !== undefined) {
      setIsValid(result);
    }
  }, {
    immediate: true
  });

  const debouncedValidateModel = debounce(async () => {
    const result = await validate(true);

    if (result !== undefined) {
      setIsValid(result);
    }
  }, 400);

  async function validateAndSyncIsValid (silent = false) {
    const result = await validate(silent);

    if (result !== undefined) {
      setIsValid(result);
    }

    return result ?? false;
  }

  watch(() => toValue(options.modelValue), () => {
    debouncedValidateModel();
  }, {
    deep: true
  });

  onMounted(async () => {
    /* nextTick даёт время зарегистрироваться полям (validatableFormItems заполняется по мере монтирования Form.Item). */
    await nextTick();
    await validateAndSyncIsValid(true);
  });

  onScopeDispose(() => {
    debouncedValidateModel.cancel();
  });

  return {
    isValid,
    validate: validateAndSyncIsValid,
    clearValidate,
    registerFormItem,
    unregisterFormItem,
    reset
  };
}
