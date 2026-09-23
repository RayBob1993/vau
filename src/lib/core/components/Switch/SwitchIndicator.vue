<script setup lang="ts">
  import { useSwitchIndicator } from './composables';
  import { useSwitchRootContext } from './context';

  const SwitchRootContext = useSwitchRootContext();

  const { isDisabled, isActive, isSuccess, isError } = useSwitchIndicator({
    switchRootContext: SwitchRootContext,
  });
</script>

<template>
  <span
    class="switch-indicator"
    :class="{
      'switch-indicator--disabled': isDisabled,
      'switch-indicator--active': isActive,
      'switch-indicator--valid': isSuccess,
      'switch-indicator--invalid': isError
    }"
  />
</template>
