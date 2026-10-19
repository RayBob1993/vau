import type { InputRootContext, InputModelValue } from '../types';
import type { MaybeNull } from '../../../types';
import { computed, mergeProps, toValue } from 'vue';

export interface UseInputBaseOptions {
  inputRootContext: MaybeNull<InputRootContext>;
}

/**
 * Модель поля и bindings для native input/textarea:
 * только listeners с Root + внутренние onFocusin/onFocusout через mergeProps.
 */
export function useInputBase (options: UseInputBaseOptions) {
  const modelValue = computed<InputModelValue>({
    get: () => toValue(options.inputRootContext?.modelValue),
    set (value: InputModelValue) {
      if (!options.inputRootContext) {
        return;
      }

      options.inputRootContext.setModelValue(value);
    }
  });

  const fieldBindings = computed(() => {
    const fieldListeners = toValue(options.inputRootContext?.fieldListeners) ?? {};

    return mergeProps(fieldListeners, {
      onFocusin: () => {
        options.inputRootContext?.setFocus(true);
      },
      onFocusout: () => {
        options.inputRootContext?.setFocus(false);
      }
    });
  });

  return {
    modelValue,
    fieldBindings
  };
}
