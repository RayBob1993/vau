<script setup lang="ts">
  import type { InputModelValue, InputProps, InputSlots, InputExpose } from './types';
  import { useInputRoot } from './composables';
  import { InputRootContextKey } from './context';
  import { InputModes, InputNativeTypes, InputTypes } from '../../constants';
  import { useComponentAttrs } from '../../composables';
  import { useFormContext } from '../Form/context';
  import { provide, useAttrs } from 'vue';

  const props = withDefaults(defineProps<InputProps>(), {
    type: InputTypes.INPUT,
    nativeType: InputNativeTypes.TEXT,
    inputMode: InputModes.TEXT
  });

  defineSlots<InputSlots>();

  const modelValue = defineModel<InputModelValue>({
    required: true
  });

  defineOptions({
    inheritAttrs: false
  });

  const { attrs, listeners } = useComponentAttrs(useAttrs());

  const { formRootContext, formItemContext, isSuccess, isError } = useFormContext();

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
    fieldListeners: () => listeners.value,
    setFocus,
    setModelValue,
    clear
  });

  defineExpose<InputExpose>({
    setFocus
  });
</script>

<template>
  <div
    v-bind="attrs"
    class="input"
    :class="{
      'input--focus': isFocus,
      'input--textarea': isTextarea,
      'input--filled': hasValue,
      'input--disabled': isDisabled,
      'input--loading': loading,
      'input--invalid': isError,
      'input--valid': isSuccess,
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
      :is-error="isError"
      :is-success="isSuccess"
    />
  </div>
</template>
