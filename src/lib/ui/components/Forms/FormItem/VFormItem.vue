<script lang="ts" setup>
  import type { IVFormItemProps } from './types';
  import {
    type FormItemSlots,
    type FormItemEmits,
    Form
  } from '@vau/core';

  const { title, ...props } = defineProps<IVFormItemProps>();

  const emit = defineEmits<FormItemEmits>();

  const slots = defineSlots<FormItemSlots>();
</script>

<template>
  <Form.Item
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
