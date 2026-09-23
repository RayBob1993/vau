<script setup lang="ts">
  import type { RadioIndicatorSlots } from './types';
  import { useRadioIndicator } from './composables';
  import { useRadioRootContext } from './context';

  defineSlots<RadioIndicatorSlots>();

  const RadioRootContext = useRadioRootContext();

  const { isDisabled, isActive, isSuccess, isError } = useRadioIndicator({
    radioRootContext: RadioRootContext,
  });
</script>

<template>
  <span
    class="radio-indicator"
    :class="{
      'radio-indicator--disabled': isDisabled,
      'radio-indicator--active': isActive,
      'radio-indicator--valid': isSuccess,
      'radio-indicator--invalid': isError
    }"
  >
    <slot
      :is-disabled="isDisabled"
      :is-active="isActive"
      :is-success="isSuccess"
      :is-error="isError"
    >
      {{ isActive ? '◉' : '⭘' }}
    </slot>
  </span>
</template>
