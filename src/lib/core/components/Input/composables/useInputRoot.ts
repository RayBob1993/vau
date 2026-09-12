import type { MaybeNull } from '../../../types';
import type { FormRootContext, FormItemContext } from '../../Form';
import type { InputModelValue, InputProps } from '../types';
import { InputTypes } from '../../../constants';
import { useToggle } from '../../../composables';
import { computed, type MaybeRefOrGetter, onMounted, onUnmounted, toValue } from 'vue';

export interface UseInputRootOptions {
  formRootContext: MaybeNull<FormRootContext>;
  formItemContext: MaybeNull<FormItemContext>;
  modelValue: MaybeRefOrGetter<InputModelValue>;
  props: MaybeRefOrGetter<InputProps>;
  onUpdateModelValue?: (value: InputModelValue) => void;
}

export function useInputRoot (options: UseInputRootOptions) {
  const [isFocus, setFocus] = useToggle();

  const props = computed<InputProps>(() => toValue(options.props));

  const isDisabled = computed<boolean>(() => {
    return Boolean(
      options.formRootContext?.props.disabled ||
      options.formItemContext?.props.disabled ||
      props.value?.loading ||
      props.value?.disabled
    );
  });

  const isTextarea = computed<boolean>(() => props.value.type === InputTypes.TEXTAREA);

  const hasValue = computed<boolean>(() => Boolean(toValue(options.modelValue)?.trim()));

  function setModelValue (value: InputModelValue) {
    options.onUpdateModelValue?.(value);
  }

  function reset () {
    setModelValue('');
  }

  onMounted(() => {
    options.formItemContext?.registerField({
      reset,
      isDisabled: () => Boolean(props.value?.disabled)
    });
  });

  onUnmounted(() => {
    options.formItemContext?.unregisterField();
  });

  return {
    isFocus,
    isDisabled,
    isTextarea,
    hasValue,
    setFocus,
    setModelValue,
    reset
  };
}
