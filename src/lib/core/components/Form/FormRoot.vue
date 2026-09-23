<script setup lang="ts" generic="MODEL extends FormModel">
  import type { FormEmits, FormExpose, FormModel, FormProps, FormSlots } from './types';
  import { useFormRoot } from './composables';
  import { FormRootContextKey } from './context';
  import { computed, provide } from 'vue';

  const props = defineProps<FormProps<MODEL>>();

  const emit = defineEmits<FormEmits>();

  defineSlots<FormSlots>();

  const modelValue = defineModel<MODEL>({
    required: true
  });

  const {
    isValid,
    hasErrors,
    isDirty,
    isPristine,
    isChanged,
    isValidating,
    canSubmit,
    registerFormItem,
    unregisterFormItem,
    initialModel,
    isResetting,
    validate,
    submit,
    clearValidate,
    reset,
    commit
  } = useFormRoot<MODEL>({
    modelValue: () => modelValue.value,
    onUpdateModelValue: value => {
      modelValue.value = value;
    },
    disabled: () => props.disabled,
    scrollToError: () => props.scrollToError,
    onValid: () => {
      emit('valid');
    },
    onInvalid: () => {
      emit('invalid');
    },
    onSubmit: payload => {
      emit('submit', payload);
    }
  });

  const scopedSlot = computed(() => ({
    isValid: isValid.value,
    isDirty: isDirty.value,
    isPristine: isPristine.value,
    isChanged: isChanged.value,
    isValidating: isValidating.value,
    canSubmit: canSubmit.value
  }));

  provide(FormRootContextKey, {
    props,
    modelValue,
    initialModel,
    isResetting,
    registerFormItem,
    unregisterFormItem
  });

  defineExpose<FormExpose>({
    isValid,
    isDirty,
    isPristine,
    isChanged,
    isValidating,
    canSubmit,
    validate,
    submit,
    clearValidate,
    reset,
    commit
  });
</script>

<template>
  <form
    class="form"
    novalidate
    :class="{
      'form--disabled': disabled,
      'form--dirty': isDirty,
      'form--changed': isChanged,
      'form--validating': isValidating,
      'form--invalid': hasErrors
    }"
    @submit.prevent="submit"
  >
    <slot v-bind="scopedSlot"/>
  </form>
</template>
