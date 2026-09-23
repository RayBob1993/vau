import { isNull } from './isNull';
import { isObject } from './isObject';

/**
 * Глубокое сравнение значений (примитивы, массивы, plain-объекты).
 * Для form-model достаточно; функции и экзотические типы сравниваются по ссылке / JSON.
 */
export function isEqual (a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (isNull(a) || isNull(b)) {
    return false;
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

  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
