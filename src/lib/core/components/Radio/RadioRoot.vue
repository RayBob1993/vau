<script setup lang="ts">
  import type { RadioProps, RadioEmits, RadioModelValue } from './types';
  import { useRadioRoot } from './composables';
  import { RadioRootContextKey } from './context';
  import { useFormContext } from '../Form/context';
  import { provide } from 'vue';

  const props = defineProps<RadioProps>();

  const emit = defineEmits<RadioEmits>();

  const modelValue = defineModel<RadioModelValue>({
    required: true
  });

  const { formRootContext, formItemContext, isValid, isInvalid } = useFormContext();

  const { isActive, isDisabled } = useRadioRoot({
    formRootContext,
    formItemContext,
    props: () => props,
    modelValue: () => modelValue.value,
    onUpdateModelValue: value => {
      modelValue.value = value;
    }
  });

  provide(RadioRootContextKey, {
    props: () => props,
    modelValue: () => modelValue.value,
    isActive: () => isActive.value,
    isDisabled: () => isDisabled.value,
    isValid: () => isValid.value,
    isInvalid: () => isInvalid.value
  });
</script>

<template>
  <label
    class="radio"
    :class="{
      'radio--disabled': isDisabled,
      'radio--active': isActive,
      'radio--invalid': isInvalid,
      'radio--valid': isValid
    }"
  >
    <input
      v-model="modelValue"
      :value="value"
      type="radio"
      :disabled="isDisabled"
      class="radio__input"
      v-on="emit"
    >

    <slot/>
  </label>
</template>
