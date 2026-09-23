import type { SwitchProps, SwitchModelValue } from '../types';
import type { FormRootContext, FormItemContext } from '../../Form';
import type { Maybe, MaybeNull } from '../../../types';
import { computed, type MaybeRefOrGetter, onMounted, onUnmounted, toValue } from 'vue';

export interface UseSwitchRootOptions {
  formRootContext: MaybeNull<FormRootContext>;
  formItemContext: MaybeNull<FormItemContext>;
  props: MaybeRefOrGetter<SwitchProps>;
  modelValue: MaybeRefOrGetter<SwitchModelValue>;
  onUpdateModelValue?: (value: SwitchModelValue) => void;
}

export function useSwitchRoot (options: UseSwitchRootOptions) {
  const props = computed<SwitchProps>(() => toValue(options.props));

  const isActive = computed<SwitchModelValue>(() => toValue(options.modelValue));

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
    isActive,
    isDisabled
  };
}
