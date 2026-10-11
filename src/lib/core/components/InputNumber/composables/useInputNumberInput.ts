import type { InputNumberRootContext, InputNumberProps, InputNumberBaseProps, InputNumberModelValue } from '../types';
import type { MaybeNull, Maybe } from '../../../types';
import { INPUT_NUMBER_VALUE_DEFAULT } from '../constants';
import { computed, toValue } from 'vue';

export interface UseInputNumberInputOptions {
  inputNumberRootContext: MaybeNull<InputNumberRootContext>;
}

export function useInputNumberInput (options: UseInputNumberInputOptions) {
  const inputRootProps = computed<Maybe<InputNumberProps>>(() => toValue(options.inputNumberRootContext?.props));

  const modelValue = computed<InputNumberModelValue>({
    get: () => toValue(options.inputNumberRootContext?.modelValue) ?? INPUT_NUMBER_VALUE_DEFAULT,
    set (value: InputNumberModelValue) {
      if (!options.inputNumberRootContext) {
        return;
      }

      options.inputNumberRootContext.setModelValue(value);
    }
  });

  const props = computed<InputNumberBaseProps>(() => ({
    step: toValue(options.inputNumberRootContext?.step),
    disabled: toValue(options.inputNumberRootContext?.isDisabled),
    min: inputRootProps.value?.min,
    max: inputRootProps.value?.max,
    readonly: inputRootProps.value?.readonly,
    placeholder: inputRootProps.value?.placeholder,
    autocomplete: inputRootProps.value?.autocomplete,
  }));

  function handleFocusin () {
    options.inputNumberRootContext?.setFocus(true);
  }

  function handleFocusout () {
    options.inputNumberRootContext?.setFocus(false);
  }

  return {
    props,
    modelValue,
    handleFocusin,
    handleFocusout
  };
}
