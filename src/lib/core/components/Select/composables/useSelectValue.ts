import type { OptionInstance, SelectRootContext, SelectProps, OptionValue } from '../types';
import type { Maybe, MaybeNull } from '../../../types';
import { isSelectMultiple } from '../utils';
import { isUndefined } from '../../../utils';
import { computed, toValue } from 'vue';

export interface UseSelectValueOptions {
  selectRootContext: MaybeNull<SelectRootContext>;
}

export function useSelectValue (options: UseSelectValueOptions) {
  const selectRootProps = computed<Maybe<SelectProps>>(() => toValue(options.selectRootContext?.props));

  const activeOption = computed<Maybe<OptionInstance>>(() => toValue(options.selectRootContext?.activeOption));

  const activeOptionValue = computed<Maybe<OptionValue>>(() => activeOption.value?.props?.title ?? activeOption.value?.props.value);

  const activeOptions = computed<Array<OptionInstance>>(() => toValue(options.selectRootContext?.activeOptions) ?? []);

  const hasValue = computed<boolean>(() => Boolean(toValue(options.selectRootContext?.hasValue)));

  const isMultiple = computed<boolean>(() => {
    if (isUndefined(options.selectRootContext?.modelValue)) {
      return false;
    }

    return isSelectMultiple(toValue(options.selectRootContext.modelValue), Boolean(selectRootProps.value?.multiple));
  });

  const placeholder = computed<Maybe<string>>(() => selectRootProps.value?.placeholder);

  /**
   * Клик по Value: фокус на Root → open.
   * Повторный клик при focus+open: close + blur.
   * Произвольный контент в Trigger/Value допустим — открытие завязано на focus Root.
   */
  function handleClick () {
    if (toValue(options.selectRootContext?.isDisabled)) {
      return;
    }

    // mousedown уже мог сфокусировать Root и открыть список — не закрываем на этом же click.
    if (options.selectRootContext?.consumeClickCloseSuppression()) {
      options.selectRootContext.focusRoot();

      return;
    }

    const isFocus = Boolean(toValue(options.selectRootContext?.isFocus));
    const isOpen = Boolean(toValue(options.selectRootContext?.isOpen));

    if (isFocus && isOpen) {
      options.selectRootContext?.close();

      return;
    }

    options.selectRootContext?.focusRoot();
  }

  return {
    activeOptionValue,
    activeOptions,
    hasValue,
    isMultiple,
    placeholder,
    handleClick
  };
}
