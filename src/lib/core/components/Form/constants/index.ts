/**
 * Скролл к первому невалидному FormItem по умолчанию (`scrollToError: true`).
 * Объект в `scrollToError` дополняет эти значения.
 */
export const FORM_SCROLL_INTO_VIEW_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'center'
};

/**
 * Текст ошибки поля, когда правило бросило исключение (например, упал запрос в async-refine).
 * Своё сообщение — ловить ошибку внутри refine и возвращать `false` / `ctx.addIssue`.
 */
export const FORM_RULE_EXCEPTION_MESSAGE = 'Не удалось проверить значение';
