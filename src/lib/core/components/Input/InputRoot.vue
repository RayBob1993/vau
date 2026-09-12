<script setup lang="ts">
  import type { InputModelValue, InputProps, InputEmits, InputSlots, InputExpose } from './types';
  import { useInputRoot } from './composables';
  import { InputRootContextKey } from './context';
  import { InputModes, InputNativeTypes, InputTypes } from '../../constants';
  import { useFormContext } from '../Form/context';
  import { provide } from 'vue';

  const props = withDefaults(defineProps<InputProps>(), {
    type: InputTypes.INPUT,
    nativeType: InputNativeTypes.TEXT,
    inputMode: InputModes.TEXT
  });

  const emit = defineEmits<InputEmits>();

  defineSlots<InputSlots>();

  const modelValue = defineModel<InputModelValue>({
    required: true
  });

  const { formRootContext, formItemContext, isValid, isInvalid } = useFormContext();

  const { isDisabled, isTextarea, hasValue, isFocus, setFocus, setModelValue, clear } = useInputRoot({
    formRootContext,
    formItemContext,
    modelValue: () => modelValue.value,
    props: () => props,
    onUpdateModelValue: value => {
      modelValue.value = value;
    }
  });

  provide(InputRootContextKey, {
    isDisabled: () => isDisabled.value,
    props: () => props,
    modelValue: () => modelValue.value,
    setFocus,
    setModelValue,
    clear,
    emit
  });

  defineExpose<InputExpose>({
    setFocus
  });
</script>

<template>
  <div
    class="input"
    :class="{
      'input--focus': isFocus,
      'input--textarea': isTextarea,
      'input--filled': hasValue,
      'input--disabled': isDisabled,
      'input--loading': loading,
      'input--invalid': isInvalid,
      'input--valid': isValid,
      [`input--theme-${theme}`]: theme,
      [`input--size-${size}`]: size,
      [`input--size-xs-${sizeXs}`]: sizeXs,
      [`input--size-sm-${sizeSm}`]: sizeSm,
      [`input--size-md-${sizeMd}`]: sizeMd,
      [`input--size-lg-${sizeLg}`]: sizeLg,
      [`input--size-xl-${sizeXl}`]: sizeXl,
      [`input--size-xxl-${sizeXxl}`]: sizeXxl
    }"
  >
    <slot
      :is-textarea="isTextarea"
      :is-focus="isFocus"
      :has-value="hasValue"
      :loading="Boolean(loading)"
      :is-invalid="isInvalid"
      :is-valid="isValid"
    />
  </div>
</template>
