import type { FormItemInstance } from '../types';
import type { Maybe, MaybeNull } from '../../../types';
import { useScrollTo } from '../../../composables';
import { type MaybeRefOrGetter, toValue } from 'vue';

export interface UseFormRootScrollErrorOptions {
  scrollToError?: MaybeRefOrGetter<Maybe<boolean | ScrollIntoViewOptions>>;
  validatableFormItems: MaybeRefOrGetter<Array<FormItemInstance>>;
}

function resolveScrollToErrorOptions (
  value: Maybe<boolean | ScrollIntoViewOptions>
): MaybeNull<ScrollIntoViewOptions> {
  if (!value) {
    return null;
  }

  if (value === true) {
    return {};
  }

  return value;
}

/**
 * Скролл к первому невалидному FormItem после «громкой» валидации формы.
 */
export function useFormRootScrollError (options: UseFormRootScrollErrorOptions) {
  function scrollToFirstError () {
    const scrollOptions = resolveScrollToErrorOptions(toValue(options.scrollToError));

    if (!scrollOptions) {
      return;
    }

    const items = toValue(options.validatableFormItems);
    const target = items.find(item => !item.isFieldValid && item.el);

    if (!target?.el) {
      return;
    }

    useScrollTo(target.el, scrollOptions);
  }

  return {
    scrollToFirstError
  };
}
