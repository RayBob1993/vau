<script setup lang="ts">
  import { useInputNumberRootContext } from './context';
  import { useInputNumberInput, useInputNumberWheel } from './composables';
  import { toValue } from 'vue';

  const InputNumberRootContext = useInputNumberRootContext();

  const { props, modelValue, handleFocusin, handleFocusout } = useInputNumberInput({
    inputNumberRootContext: InputNumberRootContext
  });

  const { handleWheel } = useInputNumberWheel({
    mousewheel: () => toValue(InputNumberRootContext?.props)?.mousewheel,
    onDecrement: () => {
      InputNumberRootContext?.handleDecrement();
    },
    onIncrement: () => {
      InputNumberRootContext?.handleIncrement();
    }
  });
</script>

<template>
  <div class="input-number-input">
    <input
      v-model.number="modelValue"
      tabindex="0"
      type="number"
      class="input-number-input__native"
      v-bind="props"
      @wheel="handleWheel"
      @focusin="handleFocusin"
      @focusout="handleFocusout"
    >
  </div>
</template>
