import type { FormItemInstance } from '../types';
import { computed, shallowRef } from 'vue';

export function useFormItems () {
  const formItems = shallowRef<Array<FormItemInstance>>([]);

  const namedFormItems = computed<Array<FormItemInstance>>(() => formItems.value.filter(item => Boolean(item.props.name)));

  const isDirty = computed<boolean>(() => namedFormItems.value.some(item => item.isDirty));

  const isPristine = computed<boolean>(() => namedFormItems.value.every(item => item.isPristine));

  const isChanged = computed<boolean>(() => namedFormItems.value.some(item => item.isChanged));

  function warnDuplicateName (newFormItem: FormItemInstance) {
    if (!import.meta.env.DEV) {
      return;
    }

    const name = newFormItem.props.name;

    if (!name) {
      return;
    }

    const duplicate = formItems.value.find(
      item => item.id !== newFormItem.id && item.props.name === name
    );

    if (!duplicate) {
      return;
    }

    console.warn(
      `[vau Form] Дублируется FormItem name="${name}". ` +
      'Имя поля должно быть уникальным среди смонтированных FormItem. ' +
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
    isDirty,
    isPristine,
    isChanged,
    registerFormItem,
    unregisterFormItem
  };
}
