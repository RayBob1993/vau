<script setup lang="ts">
  import type { SelectProps, SelectEmits, SelectModelValue } from './types';
  import { useSelectRoot } from './composables';
  import { SelectRootContextKey } from './context';
  import { vClickOutside } from '../../directives';
  import { useEscapeKey } from '../../composables';
  import { useFormContext } from '../Form/context';
  import { provide, useTemplateRef } from 'vue';

  const props = defineProps<SelectProps>();
  const emit = defineEmits<SelectEmits>();

  const modelValue = defineModel<SelectModelValue>({
    required: true
  });

  const rootRef = useTemplateRef<HTMLElement>('rootRef');

  const { formRootContext, formItemContext, isSuccess, isError } = useFormContext();

  const {
    activeOption,
    activeOptions,
    hasValue,
    isOpen,
    isDisabled,
    isFocus,
    setFocus,
    open,
    close,
    toggle,
    focusRoot,
    removeValue,
    handlePointerDown,
    consumeClickCloseSuppression,
    handleFocusIn,
    handleFocusOut,
    handleKeydown,
    registerOption,
    unregisterOption,
    setModelValue
  } = useSelectRoot({
    formRootContext,
    formItemContext,
    modelValue: () => modelValue.value,
    props: () => props,
    getRootElement: () => rootRef.value,
    onFocusRoot: () => {
      rootRef.value?.focus();
    },
    onBlurRoot: () => {
      rootRef.value?.blur();
    },
    onChangeModel: value => {
      modelValue.value = value;
    },
    onChange: value => {
      emit('change', value);
    },
    onOpen: () => {
      emit('open');

      if (rootRef.value) {
        emit('opened', rootRef.value);
      }
    },
    onClose: () => {
      emit('close');

      if (rootRef.value) {
        emit('closed', rootRef.value);
      }
    }
  });

  useEscapeKey({
    when: () => isOpen.value,
    enabled: () => !isDisabled.value,
    onEscape: () => {
      close();
    }
  });

  provide(SelectRootContextKey, {
    activeOption: () => activeOption.value,
    activeOptions: () => activeOptions.value,
    modelValue: () => modelValue.value,
    props: () => props,
    hasValue: () => hasValue.value,
    isOpen: () => isOpen.value,
    isFocus: () => isFocus.value,
    isDisabled: () => isDisabled.value,
    setFocus,
    open,
    close,
    toggle,
    focusRoot,
    consumeClickCloseSuppression,
    removeValue,
    registerOption,
    unregisterOption,
    setModelValue
  });
</script>

<template>
  <div
    ref="rootRef"
    v-click-outside="close"
    class="select"
    role="combobox"
    :tabindex="isDisabled ? undefined : 0"
    :aria-expanded="isOpen"
    :aria-disabled="isDisabled"
    :class="{
      'select--disabled': isDisabled,
      'select--open': isOpen,
      'select--focus': isFocus,
      'select--filled': hasValue,
      'select--invalid': isError,
      'select--valid': isSuccess
    }"
    @pointerdown="handlePointerDown"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
    @keydown="handleKeydown"
  >
    <slot/>
  </div>
</template>
