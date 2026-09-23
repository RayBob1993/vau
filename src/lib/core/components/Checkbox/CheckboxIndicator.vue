<script setup lang="ts">
  import type { CheckboxIndicatorSlots } from './types';
  import { useCheckboxIndicator } from './composables';
  import { useCheckboxRootContext } from './context';

  defineSlots<CheckboxIndicatorSlots>();

  const CheckboxRootContext = useCheckboxRootContext();

  const { isDisabled, isActive, isIndeterminate, isSuccess, isError } = useCheckboxIndicator({
    checkboxRootContext: CheckboxRootContext,
  });
</script>

<template>
  <span
    class="checkbox-indicator"
    :class="{
      'checkbox-indicator--disabled': isDisabled,
      'checkbox-indicator--active': isActive,
      'checkbox-indicator--indeterminate': isIndeterminate,
      'checkbox-indicator--valid': isSuccess,
      'checkbox-indicator--invalid': isError
    }"
  >
    <slot
      :is-disabled="isDisabled"
      :is-active="isActive"
      :is-indeterminate="isIndeterminate"
      :is-success="isSuccess"
      :is-error="isError"
    >
      {{ isActive ? '☑' : '□' }}
    </slot>
  </span>
</template>
