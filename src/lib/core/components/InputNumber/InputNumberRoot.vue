<script setup lang="ts">
  import type { InputNumberProps, InputNumberModelValue } from './types';
  import { useInputNumberRoot } from './composables';
  import { INPUT_NUMBER_STEP, INPUT_NUMBER_VALUE_DEFAULT, INPUT_NUMBER_MIN, INPUT_NUMBER_MAX } from './constants';
  import { InputNumberRootContextKey } from './context';
  import { useFormContext } from '../Form/context';
  import { provide } from 'vue';

  const props = withDefaults(defineProps<InputNumberProps>(), {
    min: INPUT_NUMBER_MIN,
    max: INPUT_NUMBER_MAX,
    step: INPUT_NUMBER_STEP
  });

  const modelValue = defineModel<InputNumberModelValue>({
    default: INPUT_NUMBER_VALUE_DEFAULT
  });

  const { formRootContext, formItemContext, isSuccess, isError } = useFormContext();

  const {
    step,
    isDisabled,
    isDecrementDisabled,
    isIncrementDisabled,
    handleDecrement,
    handleIncrement,
    setModelValue
  } = useInputNumberRoot({
    formRootContext,
    formItemContext,
    props: () => props,
    modelValue: () => modelValue.value,
    onUpdateModelValue: value => {
      modelValue.value = value;
    },
    onDecrement: value => {
      modelValue.value = value;
    },
    onIncrement: value => {
      modelValue.value = value;
    },
  });

  provide(InputNumberRootContextKey, {
    props: () => props,
    isDisabled: () => isDisabled.value,
    modelValue: () => modelValue.value,
    step: () => step.value,
    isDecrementDisabled: () => isDecrementDisabled.value,
    isIncrementDisabled: () => isIncrementDisabled.value,
    handleDecrement,
    handleIncrement,
    setModelValue
  });
</script>

<template>
  <div
    class="input-number"
    :class="{
      [`input-number--direction-${direction}`]: direction,
      'input-number--invalid': isError,
      'input-number--valid': isSuccess
    }"
  >
    <slot/>
  </div>
</template>
