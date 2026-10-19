<script setup lang="ts">
  import { useInputBase, useInputNative } from './composables';
  import { useInputRootContext } from './context';

  const InputRootContext = useInputRootContext();

  const { modelValue, fieldBindings } = useInputBase({
    inputRootContext: InputRootContext
  });

  const { props } = useInputNative({
    inputRootContext: InputRootContext
  });
</script>

<template>
  <input
    v-bind="fieldBindings"
    v-model="modelValue"
    :type="props.nativeType"
    :inputmode="props.inputMode"
    :readonly="props.readonly"
    :disabled="props.disabled"
    :autocomplete="props.autocomplete"
    :placeholder="props.placeholder"
    class="input-field input-field--input"
  >
</template>
