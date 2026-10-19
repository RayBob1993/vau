<script setup lang="ts">
  import { useInputBase, useInputTextarea } from './composables';
  import { useInputRootContext } from './context';

  const InputRootContext = useInputRootContext();

  const { modelValue, fieldBindings } = useInputBase({
    inputRootContext: InputRootContext
  });

  const { props } = useInputTextarea({
    inputRootContext: InputRootContext
  });
</script>

<template>
  <textarea
    v-bind="fieldBindings"
    v-model="modelValue"
    :readonly="props.readonly"
    :disabled="props.disabled"
    :autocomplete="props.autocomplete"
    :rows="props.rows"
    :cols="props.cols"
    :placeholder="props.placeholder"
    class="input-field input-field--textarea"
  />
</template>
