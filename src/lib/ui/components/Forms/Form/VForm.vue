<script lang="ts" setup generic="MODEL extends FormModel">
  import {
    type FormEmits,
    type FormExpose,
    type FormInstance,
    type FormModel,
    type FormProps,
    type FormSlots,
    Form
  } from '@vau/core';
  import { computed, useTemplateRef } from 'vue';

  const props = defineProps<FormProps<MODEL>>();

  const emit = defineEmits<FormEmits>();

  defineSlots<FormSlots>();

  const modelValue = defineModel<MODEL>({
    required: true
  });

  const rootRef = useTemplateRef<FormInstance>('rootRef');

  defineExpose<FormExpose>({
    isValid: computed(() => rootRef.value?.isValid ?? false),
    isDirty: computed(() => rootRef.value?.isDirty ?? false),
    isPristine: computed(() => rootRef.value?.isPristine ?? true),
    isChanged: computed(() => rootRef.value?.isChanged ?? false),
    canSubmit: computed(() => rootRef.value?.canSubmit ?? false),
    validate: (silent?: boolean) => rootRef.value!.validate(silent),
    clearValidate: () => rootRef.value!.clearValidate(),
    reset: () => rootRef.value!.reset()
  });
</script>

<template>
  <Form.Root
    ref="rootRef"
    v-slot="scope"
    v-model="modelValue"
    v-bind="props"
    v-on="emit"
  >
    <slot v-bind="scope"/>
  </Form.Root>
</template>
