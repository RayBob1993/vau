<script setup lang="ts">
  import type { FormItemProps, FormItemSlots, FormItemEmits, FormItemExpose, FormItemScopedSlot } from './types';
  import { FormItemContextKey, useFormRootContext } from './context';
  import { useFormItem } from './composables';
  import { computed, provide, useTemplateRef } from 'vue';

  const props = defineProps<FormItemProps>();
  const emit = defineEmits<FormItemEmits>();

  const slots  = defineSlots<FormItemSlots>();

  const formRootContext = useFormRootContext();

  const rootEl = useTemplateRef<HTMLElement>('rootEl');

  const {
    validationErrors,
    validationStatus,
    isDisabled,
    isRequired,
    registerField,
    unregisterField,
    reset,
    validate,
    clearValidateErrors
  } = useFormItem({
    formRootContext,
    props: () => props,
    el: () => rootEl.value,
    onValid: () => {
      emit('valid');
    },
    onInvalid: () => {
      emit('invalid');
    }
  });

  const scopedSlot = computed<FormItemScopedSlot>(() => ({
    validationStatus: validationStatus.value,
    isRequired: isRequired.value,
    errors: validationErrors.value
  }));

  provide(FormItemContextKey, {
    props,
    validationStatus,
    validationErrors,
    isRequired,
    isDisabled,
    registerField,
    unregisterField,
    reset,
    validate,
    clearValidateErrors
  });

  defineExpose<FormItemExpose>({
    reset,
    validate,
    clearValidateErrors
  });
</script>

<template>
  <div
    ref="rootEl"
    class="form-item"
    :class="[
      {
        'form-item--disabled': isDisabled,
        'form-item--required': isRequired,
        'form-item--invalid': validationStatus.isError,
        'form-item--validating': validationStatus.isValidating,
        'form-item--valid': validationStatus.isSuccess
      }
    ]"
  >
    <div
      v-if="slots?.header"
      class="form-item__header"
    >
      <slot
        name="header"
        v-bind="scopedSlot"
      />
    </div>

    <div class="form-item__body">
      <slot v-bind="scopedSlot"/>
    </div>

    <div
      v-if="slots.footer"
      class="form-item__footer"
    >
      <slot
        name="footer"
        v-bind="scopedSlot"
      />
    </div>
  </div>
</template>
