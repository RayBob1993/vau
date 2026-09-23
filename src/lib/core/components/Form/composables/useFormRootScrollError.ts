import type { FormItemInstance } from '../types';
import type { Maybe, MaybeNull } from '../../../types';
import { FORM_SCROLL_INTO_VIEW_OPTIONS } from '../constants';
import { useScrollTo } from '../../../composables';
import { isBeforeInDocument } from '../../../utils';
import { type MaybeRefOrGetter, toValue } from 'vue';

export interface UseFormRootScrollErrorOptions {
  scrollToError?: MaybeRefOrGetter<Maybe<boolean | ScrollIntoViewOptions>>;
  formItems: MaybeRefOrGetter<Array<FormItemInstance>>;
}

function resolveScrollToErrorOptions (
  value: Maybe<boolean | ScrollIntoViewOptions>
): MaybeNull<ScrollIntoViewOptions> {
  if (!value) {
    return null;
  }

  if (value === true) {
    return FORM_SCROLL_INTO_VIEW_OPTIONS;
  }

  return {
    ...FORM_SCROLL_INTO_VIEW_OPTIONS,
    ...value
  };
}

/**
 * Скролл к первому невалидному FormItem после «громкой» валидации формы.
 * «Первый» — по положению в DOM, а не по порядку регистрации:
 * перемонтированный через v-if FormItem попадает в конец реестра.
 */
export function useFormRootScrollError (options: UseFormRootScrollErrorOptions) {
  function findFirstErrorElement (): MaybeNull<HTMLElement> {
    let first: MaybeNull<HTMLElement> = null;

    for (const item of toValue(options.formItems)) {
      if (item.isFieldValid || !item.el) {
        continue;
      }

      if (!first || isBeforeInDocument(item.el, first)) {
        first = item.el;
      }
    }

    return first;
  }

  function scrollToFirstError () {
    const scrollOptions = resolveScrollToErrorOptions(toValue(options.scrollToError));

    if (!scrollOptions) {
      return;
    }

    const target = findFirstErrorElement();

    if (!target) {
      return;
    }

    useScrollTo(target, scrollOptions);
  }

  return {
    scrollToFirstError
  };
}
