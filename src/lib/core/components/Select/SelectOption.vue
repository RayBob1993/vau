<script setup lang="ts">
  import type { OptionProps, OptionSlots } from './types';
  import { useSelectOption } from './composables';
  import { useSelectRootContext } from './context';

  const props = defineProps<OptionProps>();

  defineSlots<OptionSlots>();

  const selectRootContext = useSelectRootContext();

  const { isActive, isDisabled, handleChange } = useSelectOption({
    selectRootContext,
    props: () => props
  });
</script>

<template>
  <div
    class="select-option"
    role="option"
    :tabindex="isDisabled ? undefined : -1"
    :aria-selected="isActive"
    :aria-disabled="isDisabled"
    :class="{
      'select-option--active': isActive,
      'select-option--disabled': isDisabled
    }"
    @click="handleChange(value)"
  >
    <slot
      :is-active="isActive"
      :is-disabled="isDisabled"
    >
      {{ title }}
    </slot>
  </div>
</template>
