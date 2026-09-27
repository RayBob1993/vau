<script lang="ts" setup generic="MODEL extends FormModel">
  import { type FormModel, type FormProps, type FormSlots, Form } from '@vau/core';

  defineProps<FormProps<MODEL>>();

  defineSlots<FormSlots>();
</script>

<template>
  <Form.Root :form="form">
    <slot/>
  </Form.Root>
</template>
