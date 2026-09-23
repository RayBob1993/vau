import type { CheckboxRootContext } from '../types';
import type { MaybeNull } from '../../../types';
import { computed, toValue } from 'vue';

export interface UseCheckboxIndicatorOptions {
  checkboxRootContext: MaybeNull<CheckboxRootContext>;
}

export function useCheckboxIndicator (options: UseCheckboxIndicatorOptions) {
  const isDisabled = computed<boolean>(() => Boolean(toValue(options.checkboxRootContext?.isDisabled)));
  const isActive = computed<boolean>(() => Boolean(toValue(options.checkboxRootContext?.isActive)));
  const isIndeterminate = computed<boolean>(() => Boolean(toValue(options.checkboxRootContext?.isIndeterminate)));
  const isSuccess = computed<boolean>(() => Boolean(toValue(options.checkboxRootContext?.isSuccess)));
  const isError = computed<boolean>(() => Boolean(toValue(options.checkboxRootContext?.isError)));

  return {
    isDisabled,
    isActive,
    isIndeterminate,
    isSuccess,
    isError
  };
}
