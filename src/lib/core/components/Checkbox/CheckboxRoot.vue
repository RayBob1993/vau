<script setup lang="ts">
  import type { CheckboxProps, CheckboxEmits, CheckboxModelValue } from './types';
  import { CheckboxRootContextKey } from './context';
  import { useCheckboxRoot } from './composables';
  import { useFormContext } from '../Form/context';
  import { provide, useTemplateRef, watch } from 'vue';

  const props = defineProps<CheckboxProps>();

  const emit = defineEmits<CheckboxEmits>();

  const modelValue = defineModel<CheckboxModelValue>();

  const { formRootContext, formItemContext, isValid, isInvalid } = useFormContext();

  const { isChecked, isDisabled, isIndeterminate } = useCheckboxRoot({
    formRootContext,
    formItemContext,
    props: () => props,
    modelValue: () => modelValue.value,
    onUpdateModelValue: value => {
      modelValue.value = value;
    }
  });

  const inputRef = useTemplateRef<HTMLInputElement>('inputRef');

  watch([inputRef, isIndeterminate], ([el, indeterminate]) => {
    if (el) {
      el.indeterminate = Boolean(indeterminate);
    }
  }, {
    immediate: true
  });

  provide(CheckboxRootContextKey, {
    props: () => props,
    modelValue: () => modelValue.value,
    isActive: () => isChecked.value,
    isDisabled: () => isDisabled.value,
    isIndeterminate: () => isIndeterminate.value,
    isValid: () => isValid.value,
    isInvalid: () => isInvalid.value
  });
</script>

<template>
  <label
    class="checkbox"
    :class="{
      'checkbox--disabled': isDisabled,
      'checkbox--active': isChecked,
      'checkbox--indeterminate': isIndeterminate,
      'checkbox--invalid': isInvalid,
      'checkbox--valid': isValid
    }"
  >
    <input
      ref="inputRef"
      v-model="modelValue"
      :value="value"
      type="checkbox"
      :disabled="isDisabled"
      :checked="isChecked"
      class="checkbox__input"
      v-on="emit"
    >

    <slot/>
  </label>
</template>
