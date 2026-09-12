import type { InputNumberModelValue, InputNumberProps } from '../types';
import type { FormRootContext, FormItemContext } from '../../Form';
import type { MaybeNull } from '../../../types';
import { INPUT_NUMBER_STEP } from '../constants';
import { isNumber } from '../../../utils';
import { computed, type MaybeRefOrGetter, onMounted, onUnmounted, toValue } from 'vue';

export interface UseInputNumberRootOptions {
  formRootContext: MaybeNull<FormRootContext>;
  formItemContext: MaybeNull<FormItemContext>;
  props: MaybeRefOrGetter<InputNumberProps>;
  modelValue: MaybeRefOrGetter<InputNumberModelValue>;
  onDecrement?: (value: InputNumberModelValue) => void;
  onIncrement?: (value: InputNumberModelValue) => void;
  onUpdateModelValue?: (value: InputNumberModelValue) => void;
}

export function useInputNumberRoot (options: UseInputNumberRootOptions) {
  const props = computed<InputNumberProps>(() => toValue(options.props));

  const modelValue = computed<InputNumberModelValue>(() => toValue(options.modelValue));
  const step = computed<number>(() => props.value.step || INPUT_NUMBER_STEP);

  const isDisabled = computed<boolean>(() => {
    return Boolean(
      options.formRootContext?.props.disabled ||
      options.formItemContext?.props.disabled ||
      props.value.disabled
    );
  });

  const isDecrementDisabled = computed<boolean>(() => {
    return isDisabled.value || (isNumber(props.value.min) && modelValue.value === props.value.min);
  });
  const isIncrementDisabled = computed<boolean>(() => {
    return isDisabled.value || (isNumber(props.value.max) && !(modelValue.value < props.value.max));
  });

  function handleDecrement () {
    if (props.value.readonly) {
      return;
    }

    const newValue = modelValue.value - step.value;

    // Если min не указан или значение больше минимального
    if (!isNumber(props.value.min) || newValue >= props.value.min) {
      options.onDecrement?.(newValue);
    }
  }

  function handleIncrement () {
    if (props.value.readonly) {
      return;
    }

    const newValue = modelValue.value + step.value;

    // Если max не указан или значение меньше максимального
    if (!isNumber(props.value.max) || newValue <= props.value.max) {
      options.onIncrement?.(newValue);
    }
  }

  function setModelValue (value: InputNumberModelValue) {
    options.onUpdateModelValue?.(value);
  }

  onMounted(() => {
    options.formItemContext?.registerField({
      isDisabled: () => Boolean(props.value.disabled)
    });
  });

  onUnmounted(() => {
    options.formItemContext?.unregisterField();
  });

  return {
    step,
    isDisabled,
    isDecrementDisabled,
    isIncrementDisabled,
    handleDecrement,
    handleIncrement,
    setModelValue
  };
}
