import type { FormItemField } from '../types';
import { computed, shallowRef, toValue } from 'vue';

/**
 * Контролы, зарегистрированные внутри FormItem (Input, Select, группа Radio/Checkbox…).
 *
 * Поле считается disabled, когда disabled **все** контролы: одна выключенная опция
 * группы не снимает валидацию с поля, полностью выключенная группа — снимает.
 */
export function useFormField () {
  const fields = shallowRef<Array<FormItemField>>([]);

  const isFieldDisabled = computed<boolean>(() => {
    if (fields.value.length === 0) {
      return false;
    }

    return fields.value.every(field => Boolean(toValue(field.isDisabled)));
  });

  /**
   * @returns Функция отписки — вызывать в `onUnmounted` контрола.
   */
  function registerField (field: FormItemField): VoidFunction {
    fields.value = [...fields.value, field];

    return () => {
      fields.value = fields.value.filter(item => item !== field);
    };
  }

  return {
    fields,
    isFieldDisabled,
    registerField
  };
}
