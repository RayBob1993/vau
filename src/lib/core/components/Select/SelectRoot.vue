<script setup lang="ts">
  import type { SelectProps, SelectEmits, SelectModelValue } from './types';
  import { useSelectRoot } from './composables';
  import { SelectRootContextKey } from './context';
  import { vClickOutside } from '../../directives';
  import { useFormContext } from '../Form/context';
  import { provide } from 'vue';

  const props = defineProps<SelectProps>();
  const emit = defineEmits<SelectEmits>();

  const modelValue = defineModel<SelectModelValue>({
    required: true
  });

  const { formRootContext, formItemContext, isValid, isInvalid } = useFormContext();

  const {
    activeOption,
    activeOptions,
    hasValue,
    isOpen,
    isDisabled,
    open,
    close,
    toggle,
    registerOption,
    unregisterOption,
    setModelValue
  } = useSelectRoot({
    formRootContext,
    formItemContext,
    modelValue: () => modelValue.value,
    props: () => props,
    onChangeModel: value => {
      modelValue.value = value;
    },
    onChange: value => {
      emit('change', value);
    }
  });

  provide(SelectRootContextKey, {
    activeOption: () => activeOption.value,
    activeOptions: () => activeOptions.value,
    modelValue: () => modelValue.value,
    props: () => props,
    hasValue: () => hasValue.value,
    isOpen: () => isOpen.value,
    isDisabled: () => isDisabled.value,
    open,
    close,
    toggle,
    registerOption,
    unregisterOption,
    setModelValue
  });
</script>

<template>
  <div
    v-click-outside="close"
    class="select"
    :class="{
      'select--disabled': isDisabled,
      'select--open': isOpen,
      'select--filled': hasValue,
      'select--invalid': isInvalid,
      'select--valid': isValid
    }"
    :aria-disabled="isDisabled"
  >
    <slot/>
  </div>
</template>
