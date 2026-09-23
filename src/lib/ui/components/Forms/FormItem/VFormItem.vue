<script lang="ts" setup>
  import type { IVFormItemProps } from './types';
  import {
    type FormItemExpose,
    type FormItemInstance,
    type FormItemSlots,
    type FormItemEmits,
    Form
  } from '@vau/core';
  import { computed, useTemplateRef } from 'vue';

  const { title, ...props } = defineProps<IVFormItemProps>();

  const emit = defineEmits<FormItemEmits>();

  const slots = defineSlots<FormItemSlots>();

  const itemRef = useTemplateRef<FormItemInstance>('itemRef');

  defineExpose<FormItemExpose>({
    isValid: computed(() => itemRef.value?.isValid ?? true),
    isDirty: computed(() => itemRef.value?.isDirty ?? false),
    isPristine: computed(() => itemRef.value?.isPristine ?? true),
    isChanged: computed(() => itemRef.value?.isChanged ?? false),
    validate: (silent?: boolean) => itemRef.value!.validate(silent),
    clearValidateErrors: () => itemRef.value!.clearValidateErrors(),
    reset: () => itemRef.value!.reset()
  });
</script>

<template>
  <Form.Item
    ref="itemRef"
    v-bind="props"
    v-on="emit"
  >
    <template
      v-if="title || slots.header"
      #header="headerScope"
    >
      <slot
        name="header"
        v-bind="headerScope"
      >
        <Form.ItemTitle>
          {{ title }}

          <Form.ItemRequired v-if="headerScope.isRequired"/>
        </Form.ItemTitle>
      </slot>
    </template>

    <template #default="scope">
      <slot v-bind="scope"/>
    </template>

    <template #footer="scope">
      <slot
        name="footer"
        v-bind="scope"
      >
        <Form.ItemErrors/>
      </slot>
    </template>
  </Form.Item>
</template>
