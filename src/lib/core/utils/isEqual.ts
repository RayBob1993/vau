import { isNull } from './isNull';
import { isObject } from './isObject';

/**
 * Глубокое сравнение значений: примитивы, Date, массивы, plain-объекты.
 *
 * Объекты сравниваются по набору ключей и значениям, порядок ключей не важен,
 * `{ a: undefined }` и `{}` — разные. Функции и прочие экзотические типы — по ссылке.
 */
export function isEqual (a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (isNull(a) || isNull(b)) {
    return false;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    return a.every((item, index) => isEqual(item, b[index]));
  }

  if (!isObject(a) || !isObject(b)) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every(key => Object.hasOwn(b, key) && isEqual(a[key], b[key]));
}
