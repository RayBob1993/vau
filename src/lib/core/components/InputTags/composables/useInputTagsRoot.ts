import type { InputTagsProps, InputTagsModelValue } from '../types';
import type { FormRootContext, FormItemContext } from '../../Form';
import type { Maybe, MaybeNull } from '../../../types';
import { computed, type MaybeRefOrGetter, onMounted, onUnmounted, toValue } from 'vue';

export interface UseInputTagsRootOptions {
  formRootContext: MaybeNull<FormRootContext>;
  formItemContext: MaybeNull<FormItemContext>;
  props: MaybeRefOrGetter<InputTagsProps>;
  modelValue: MaybeRefOrGetter<InputTagsModelValue>;
  onUpdateModelValue?: (value: InputTagsModelValue) => void;
}

export function useInputTagsRoot (options: UseInputTagsRootOptions) {
  const props = computed<InputTagsProps>(() => toValue(options.props));

  const isDisabled = computed<boolean>(() => {
    return Boolean(
      options.formRootContext?.props.disabled ||
      options.formItemContext?.props.disabled ||
      props.value?.disabled
    );
  });

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
    isDisabled
  };
}
