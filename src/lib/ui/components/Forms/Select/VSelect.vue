<script lang="ts" setup>
  import { Select, type SelectProps, type SelectModelValue, type SelectEmits, type UnscopedSlot } from '@vau/core';

  const props = defineProps<SelectProps>();

  const emit = defineEmits<SelectEmits>();

  defineSlots<{
    default?: UnscopedSlot;
    value?: UnscopedSlot;
  }>();

  const modelValue = defineModel<SelectModelValue>({
    required: true
  });
</script>

<template>
  <Select.Root
    v-bind="props"
    v-model="modelValue"
    @change="emit('change', $event)"
    @open="emit('open')"
    @close="emit('close')"
    @clear="emit('clear')"
  >
    <Select.Trigger>
      <Select.Value>
        <slot name="value"/>
      </Select.Value>
    </Select.Trigger>

    <Select.Dropdown>
      <Select.Scrollbar>
        <slot/>
      </Select.Scrollbar>
    </Select.Dropdown>
  </Select.Root>
</template>
