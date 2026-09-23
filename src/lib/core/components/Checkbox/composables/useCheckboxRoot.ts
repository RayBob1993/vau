import type { CheckboxProps, CheckboxModelValue } from '../types';
import type { FormRootContext, FormItemContext } from '../../Form';
import type { MaybeNull, Maybe } from '../../../types';
import { isBoolean } from '../../../utils';
import { computed, type MaybeRefOrGetter, onMounted, onUnmounted, toValue } from 'vue';

export interface UseCheckboxRootOptions {
  formRootContext: MaybeNull<FormRootContext>;
  formItemContext: MaybeNull<FormItemContext>;
  props: MaybeRefOrGetter<CheckboxProps>;
  modelValue: MaybeRefOrGetter<Maybe<CheckboxModelValue>>;
  onUpdateModelValue?: (value: CheckboxModelValue) => void;
}

export function useCheckboxRoot (options: UseCheckboxRootOptions) {
  const props = computed<CheckboxProps>(() => toValue(options.props));

  const modelValue = computed<Maybe<CheckboxModelValue>>(() => toValue(options.modelValue));

  const isDisabled = computed<boolean>(() => {
    return Boolean(
      options.formRootContext?.props.disabled ||
      options.formItemContext?.props.disabled ||
      props.value?.disabled
    );
  });

  const isActive = computed<boolean>(() => {
    if (isBoolean(modelValue.value)) {
      return modelValue.value;
    }

    if (props.value.value && Array.isArray(modelValue.value)) {
      return modelValue.value.includes(props.value.value);
    }

    return false;
  });

  const isChecked = computed<boolean>(() => Boolean(isActive.value || props.value?.checked));

  const isIndeterminate = computed<boolean>(() => Boolean(props.value?.indeterminate));

  let unregisterField: Maybe<VoidFunction>;

  onMounted(() => {
    /* Поле disabled, только если disabled все чекбоксы группы — агрегирует FormItem. */
    unregisterField = options.formItemContext?.registerField({
      isDisabled: () => Boolean(props.value.disabled)
    });
  });

  onUnmounted(() => {
    unregisterField?.();
  });

  return {
    isActive,
    isDisabled,
    isChecked,
    isIndeterminate
  };
}
