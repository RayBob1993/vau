<script setup lang="ts">
  import type { InputCodeProps, InputCodeModelValue } from './types';
  import { useInputCodeRoot } from './composables';
  import { InputCodeRootContextKey } from './context';
  import { useFormContext } from '../Form/context';
  import { provide } from 'vue';

  const props = defineProps<InputCodeProps>();
  const modelValue = defineModel<InputCodeModelValue>({
    required: true,
  });

  const { formRootContext, formItemContext, isSuccess, isError } = useFormContext();

  const { isDisabled } = useInputCodeRoot({
    formRootContext,
    formItemContext,
    modelValue: () => modelValue.value,
    props: () => props,
    onUpdateModelValue: value => {
      modelValue.value = value;
    }
  });

  provide(InputCodeRootContextKey, {
    props: () => props,
    isDisabled: () => isDisabled.value,
  });
</script>

<template>
  <div
    class="input-code"
    :class="{
      'input-code--disabled': isDisabled,
      'input-code--invalid': isError,
      'input-code--valid': isSuccess
    }"
  >
    <slot/>
  </div>
</template>
