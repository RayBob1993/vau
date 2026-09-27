import type { FormItemInstance } from '../types';
import { shallowRef } from 'vue';

export function useFormItems () {
  const formItems = shallowRef<Array<FormItemInstance>>([]);

  function warnDuplicateName (newFormItem: FormItemInstance) {
    if (!import.meta.env.DEV) {
      return;
    }

    const name = newFormItem.name;

    if (!name) {
      return;
    }

    const duplicate = formItems.value.find(
      item => item.id !== newFormItem.id && item.name === name
    );

    if (!duplicate) {
      return;
    }

    console.warn(
      `[vau Form] Дублируется FormItem field "${name}". ` +
      'Поле должно быть уникальным среди смонтированных FormItem. ' +
      `(id: ${duplicate.id}, ${newFormItem.id})`
    );
  }

  function registerFormItem (newFormItem: FormItemInstance) {
    warnDuplicateName(newFormItem);

    const index = formItems.value.findIndex(item => item.id === newFormItem.id);

    if (index === -1) {
      formItems.value = [...formItems.value, newFormItem];

      return;
    }

    formItems.value = formItems.value.map(item => (item.id === newFormItem.id ? newFormItem : item));
  }

  function unregisterFormItem (id: string) {
    formItems.value = formItems.value.filter(formItem => formItem.id !== id);
  }

  return {
    formItems,
    registerFormItem,
    unregisterFormItem
  };
}
