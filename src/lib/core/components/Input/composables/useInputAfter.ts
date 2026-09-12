import type { InputProps, InputRootContext } from '../types';
import type { Maybe, MaybeNull } from '../../../types';
import { computed, toValue } from 'vue';

export interface UseInputAfterOptions {
  inputRootContext: MaybeNull<InputRootContext>;
}

export function useInputAfter (options: UseInputAfterOptions) {
  const inputRootProps = computed<Maybe<InputProps>>(() => toValue(options.inputRootContext?.props));

  const isClearable = computed<boolean>(() => Boolean(inputRootProps.value?.clearable));

  function handleClear () {
    options.inputRootContext?.clear();
  }

  return {
    isClearable,
    handleClear
  };
}
