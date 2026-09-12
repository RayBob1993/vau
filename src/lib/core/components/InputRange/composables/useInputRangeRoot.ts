import type { MaybeNull } from '../../../types';
import type { FormRootContext, FormItemContext } from '../../Form';
import type { InputRangeModelValue, InputRangeProps } from '../types';
import { computed, type MaybeRefOrGetter, onMounted, onUnmounted, toValue } from 'vue';

export interface UseInputRangeRootOptions {
  formRootContext: MaybeNull<FormRootContext>;
  formItemContext: MaybeNull<FormItemContext>;
  modelValue: MaybeRefOrGetter<InputRangeModelValue>;
  props: MaybeRefOrGetter<InputRangeProps>;
  onUpdateModelValue?: (value: InputRangeModelValue) => void;
}

export function useInputRangeRoot (options: UseInputRangeRootOptions) {
  const props = computed<InputRangeProps>(() => toValue(options.props));

  const isDisabled = computed<boolean>(() => {
    return Boolean(
      options.formRootContext?.props.disabled ||
      options.formItemContext?.props.disabled ||
      props.value?.disabled
    );
  });

  onMounted(() => {
    options.formItemContext?.registerField({
      isDisabled: () => Boolean(props.value?.disabled)
    });
  });

  onUnmounted(() => {
    options.formItemContext?.unregisterField();
  });

  return {
    isDisabled
  };
}
