import type { SwitchRootContext } from '../types';
import type { MaybeNull } from '../../../types';
import { computed, toValue } from 'vue';

export interface UseSwitchIndicatorOptions {
  switchRootContext: MaybeNull<SwitchRootContext>;
}

export function useSwitchIndicator (options: UseSwitchIndicatorOptions) {
  const isDisabled = computed<boolean>(() => Boolean(toValue(options.switchRootContext?.isDisabled)));
  const isActive = computed<boolean>(() => Boolean(toValue(options.switchRootContext?.isActive)));
  const isSuccess = computed<boolean>(() => Boolean(toValue(options.switchRootContext?.isSuccess)));
  const isError = computed<boolean>(() => Boolean(toValue(options.switchRootContext?.isError)));

  return {
    isDisabled,
    isActive,
    isSuccess,
    isError
  };
}
