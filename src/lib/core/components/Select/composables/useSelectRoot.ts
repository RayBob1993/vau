import type { SelectProps, SelectModelValue, OptionValue } from '../types';
import type { Maybe, MaybeNull } from '../../../types';
import type { FormRootContext, FormItemContext } from '../../Form';
import { useSelectOptions } from './useSelectOptions';
import { useActiveSelectOptions } from './useActiveSelectOptions';
import { useSelectOpen } from './useSelectOpen';
import { isSelectMultiple } from '../utils';
import { computed, type MaybeRefOrGetter, onMounted, onUnmounted, toValue } from 'vue';

export interface UseSelectRootOptions {
  formRootContext: MaybeNull<FormRootContext>;
  formItemContext: MaybeNull<FormItemContext>;
  modelValue: MaybeRefOrGetter<SelectModelValue>;
  props: MaybeRefOrGetter<SelectProps>;
  onChange?: (value: OptionValue) => void;
  onChangeModel?: (value: SelectModelValue) => void;
  onOpen?: VoidFunction;
  onClose?: VoidFunction;
  onBlurRoot?: VoidFunction;
  onFocusRoot?: VoidFunction;
  getRootElement?: () => MaybeNull<HTMLElement>;
}

export function useSelectRoot (options: UseSelectRootOptions) {
  const modelValue = computed<SelectModelValue>(() => toValue(options.modelValue));

  const props = computed<SelectProps>(() => toValue(options.props));

  const { options: selectOptions, registerOption, unregisterOption } = useSelectOptions();

  const { activeOption, activeOptions } = useActiveSelectOptions({
    multiple: () => Boolean(props.value.multiple),
    options: () => selectOptions.value,
    modelValue: () => modelValue.value
  });

  const isDisabled = computed<boolean>(() => {
    return Boolean(
      options.formRootContext?.props.disabled ||
      options.formItemContext?.props.disabled ||
      props.value?.disabled
    );
  });

  const {
    isOpen,
    isFocus,
    setFocus,
    open,
    close,
    toggle,
    focusRoot,
    handlePointerDown,
    consumeClickCloseSuppression,
    handleFocusIn,
    handleFocusOut,
    handleKeydown
  } = useSelectOpen({
    isDisabled: () => isDisabled.value,
    onOpen: options.onOpen,
    onClose: options.onClose,
    onBlurRoot: options.onBlurRoot,
    onFocusRoot: options.onFocusRoot,
    getRootElement: options.getRootElement
  });

  const hasValue = computed<boolean>(() => {
    if (isSelectMultiple(modelValue.value, props.value.multiple)) {
      return modelValue.value.length > 0;
    }

    return Boolean(modelValue.value);
  });

  function setModelValue (value: OptionValue) {
    if (isDisabled.value) {
      return;
    }

    if (isSelectMultiple(modelValue.value, props.value.multiple)) {
      const values: Set<OptionValue> = new Set<OptionValue>([...modelValue.value]);

      if (values.has(value)) {
        values.delete(value);
      } else {
        values.add(value);
      }

      options.onChangeModel?.([...values]);
    } else {
      options.onChangeModel?.(value);
    }

    options.onChange?.(value);
  }

  /**
   * Удаляет значение из multiple-модели без close/blur (задел под теги в Value).
   */
  function removeValue (value: OptionValue) {
    if (isDisabled.value) {
      return;
    }

    if (!isSelectMultiple(modelValue.value, props.value.multiple)) {
      return;
    }

    if (!modelValue.value.includes(value)) {
      return;
    }

    options.onChangeModel?.(modelValue.value.filter(item => item !== value));
  }

  let unregisterField: Maybe<VoidFunction>;

  onMounted(() => {
    unregisterField = options.formItemContext?.registerField({
      isDisabled: () => Boolean(props.value.disabled)
    });
  });

  onUnmounted(() => {
    unregisterField?.();
  });

  return {
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
  };
}
