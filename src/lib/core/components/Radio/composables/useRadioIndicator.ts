import type { RadioRootContext } from '../types';
import type { MaybeNull } from '../../../types';
import { computed, toValue } from 'vue';

export interface UseRadioIndicatorOptions {
  radioRootContext: MaybeNull<RadioRootContext>;
}

export function useRadioIndicator (options: UseRadioIndicatorOptions) {
  const isDisabled = computed<boolean>(() => Boolean(toValue(options.radioRootContext?.isDisabled)));
  const isActive = computed<boolean>(() => Boolean(toValue(options.radioRootContext?.isActive)));
  const isSuccess = computed<boolean>(() => Boolean(toValue(options.radioRootContext?.isSuccess)));
  const isError = computed<boolean>(() => Boolean(toValue(options.radioRootContext?.isError)));

  return {
    isDisabled,
    isActive,
    isSuccess,
    isError
  };
}
