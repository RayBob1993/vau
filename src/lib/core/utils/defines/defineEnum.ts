/**
 * Объявляет неизменяемый словарь констант (enum-подобный объект).
 *
 * Обёртка над `Object.freeze` с выводом литеральных типов через `const`-generic:
 * на месте вызова не нужен `as const`.
 *
 * @example
 * export const Sizes = defineEnum({
 *   SMALL: 'small',
 *   LARGE: 'large',
 * });
 */
export function defineEnum <const T extends Record<PropertyKey, unknown>> (values: T): Readonly<T> {
  return Object.freeze(values);
}
