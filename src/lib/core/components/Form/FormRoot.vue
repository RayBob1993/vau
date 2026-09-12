<script setup lang="ts" generic="MODEL extends FormModel">
  import type { FormEmits, FormExpose, FormModel, FormProps, FormSlots } from './types';
  import { useFormRoot } from './composables';
  import { FormRootContextKey } from './context';
  import { provide } from 'vue';

  const props = defineProps<FormProps<MODEL>>();

  const emit = defineEmits<FormEmits>();

  defineSlots<FormSlots>();

  const modelValue = defineModel<MODEL>({
    required: true
  });

  const {
    isValid,
    registerFormItem,
    unregisterFormItem,
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
    const isValid = await validate();

    emit('submit', {
      isValid,
      reset
    });
  }

  provide(FormRootContextKey, {
    props,
    modelValue,
    registerFormItem,
    unregisterFormItem
  });

  defineExpose<FormExpose>({
    isValid,
    validate,
    clearValidate,
    reset
  });
</script>

<template>
  <form
    class="form"
    :class="{
      'form--disabled': disabled
    }"
    @submit.prevent="handleSubmit"
  >
    <slot :is-valid="isValid"/>
  </form>
</template>
