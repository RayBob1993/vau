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
    showAsInvalid,
    isDirty,
    isPristine,
    isChanged,
    isValidating,
    canSubmit,
    registerFormItem,
    unregisterFormItem,
    initialModel,
    validate,
    clearValidate,
    reset
  } = useFormRoot<MODEL>({
    modelValue: () => modelValue.value,
    onUpdateModelValue: value => {
      modelValue.value = value;
    },
    scrollToError: () => props.scrollToError,
    onValid: () => {
      emit('valid');
    },
    onInvalid: () => {
      emit('invalid');
    }
  });

  async function handleSubmit () {
    const isValidResult = await validate();

    emit('submit', {
      isValid: isValidResult,
      reset
    });
  }

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
    clearValidate,
    reset
  });
</script>

<template>
  <form
    class="form"
    :class="{
      'form--disabled': disabled,
      'form--dirty': isDirty,
      'form--changed': isChanged,
      'form--validating': isValidating,
      'form--invalid': showAsInvalid
    }"
    @submit.prevent="handleSubmit"
  >
    <slot v-bind="scopedSlot"/>
  </form>
</template>
