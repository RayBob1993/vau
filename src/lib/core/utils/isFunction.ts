/**
 * @description `isFunction` - Проверка переданного значения на функцию
 * @param {unknown} value - Значение для проверки.
 * @returns {boolean} - Возвращает true, если значение является функцией; иначе false.
 */
export function isFunction (value: unknown): value is (...args: Array<unknown>) => unknown {
  return typeof value === 'function';
}
