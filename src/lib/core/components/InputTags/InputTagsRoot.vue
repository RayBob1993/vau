<script setup lang="ts">
  import type { InputTagsProps, InputTagsModelValue, InputTagsEmits } from './types';
  import { InputTagsRootContextKey } from './context';
  import { useInputTagsRoot } from './composables';
  import { useFormContext } from '../Form/context';
  import { provide } from 'vue';

  const props = defineProps<InputTagsProps>();

  const emit = defineEmits<InputTagsEmits>();

  const modelValue = defineModel<InputTagsModelValue>({
    required: true,
  });

  const { formRootContext, formItemContext, isValid, isInvalid } = useFormContext();

  const { isDisabled } = useInputTagsRoot({
    formRootContext,
    formItemContext,
    props: () => props,
    modelValue: () => modelValue.value,
    onUpdateModelValue: value => {
      modelValue.value = value;
    }
  });

  provide(InputTagsRootContextKey, {
    props: () => props,
    modelValue: () => modelValue.value,
    isDisabled: () => isDisabled.value,
  });
</script>

<template>
  <div
    class="input-tags"
    :class="{
      'input-tags--disabled': isDisabled,
      'input-tags--invalid': isInvalid,
      'input-tags--valid': isValid
    }"
  >
    <slot/>
  </div>
</template>
