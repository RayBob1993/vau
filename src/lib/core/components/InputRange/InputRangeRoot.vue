<script setup lang="ts">
  import type { InputRangeModelValue, InputRangeProps } from './types';
  import { useInputRangeRoot } from './composables';
  import { InputRangeRootContextKey } from './context';
  import { useFormContext } from '../Form/context';
  import { provide } from 'vue';

  const props = defineProps<InputRangeProps>();

  const modelValue = defineModel<InputRangeModelValue>({
    required: true,
  });

  const { formRootContext, formItemContext, isSuccess, isError } = useFormContext();

  const { isDisabled } = useInputRangeRoot({
    formRootContext,
    formItemContext,
    modelValue: () => modelValue.value,
    props: () => props,
    onUpdateModelValue: value => {
      modelValue.value = value;
    }
  });

  provide(InputRangeRootContextKey, {
    props: () => props,
    isDisabled: () => isDisabled.value,
  });
</script>

<template>
  <div
    class="input-range"
    :class="{
      'input-range--disabled': isDisabled,
      'input-range--invalid': isError,
      'input-range--valid': isSuccess
    }"
  >
    <slot/>
  </div>
</template>
