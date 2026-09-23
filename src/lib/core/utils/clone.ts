import { isBoolean } from './isBoolean';
import { isFunction } from './isFunction';
import { isNull } from './isNull';
import { isNumber } from './isNumber';
import { isObject } from './isObject';
import { isString } from './isString';
import { isUndefined } from './isUndefined';

/**
 * Ссылка для WeakMap: не примитив и не функция.
 * `isObject` сюда не годится — она отличает только обычный объект, а массив и Date нужно клонировать.
 */
function isCloneableReference (value: unknown): value is object {
  if (isNull(value) || isUndefined(value) || isString(value) || isNumber(value) || isBoolean(value) || isFunction(value)) {
    return false;
  }

  // symbol, bigint и NaN: отдельных проверок нет, в WeakMap их класть нельзя.
  return Object(value) === value;
}

/**
 * @description `clone` - Клонирует переданное значение, создавая его глубокую копию.
 *
 * Функция поддерживает клонирование объектов, массивов и примитивных типов.
 * При клонировании объектов и массивов происходит рекурсивное копирование их свойств и элементов.
 * Методы также клонируются с привязкой к новому объекту.
 *
 * @template T - Тип значения, которое будет клонироваться.
 * @param value - Значение, которое нужно клонировать.
 * @param hash - Кеширование
 * @returns Глубокая копия переданного значения того же типа T.
 *
 * @example
 * const original = {
 *   name: 'Дима',
 *   age: 31,
 *   greet() {
 *     console.log(`Привет, меня зовут ${this.name}`);
 *   },
 *   nested: {
 *     array: [1, 2, 3],
 *     method() {
 *       console.log('вложенный метод');
 *     }
 *   }
 * };
 *
 * const cloned = clone(original);
 * cloned.greet(); // Привет, меня зовут Дима
 * cloned.nested.method(); // вложенный метод
 *
 * original.name = 'Вася';
 * console.log(cloned.name); // Вася
 */

export function clone <T> (value: T, hash = new WeakMap<object, unknown>): T {
  if (!isCloneableReference(value)) {
    return value;
  }

  // Проверяем кеш для циклических ссылок
  if (hash.has(value)) {
    return hash.get(value) as T;
  }

  // Обрабатываем специальные объекты: Date
  if (value instanceof Date) {
    const cloned = new Date();

    cloned.setTime(value.getTime());

    return cloned as T;
  }

  // Обрабатываем специальные объекты: RegExp
  if (value instanceof RegExp) {
    const cloned = new RegExp(value.source, value.flags);

    hash.set(value, cloned);

    return cloned as T;
  }

  // Обрабатываем Map
  if (value instanceof Map) {
    const cloned = new Map();

    hash.set(value, cloned);

    value.forEach((val, key) => {
      cloned.set(clone(key, hash), clone(val, hash));
    });

    return cloned as T;
  }

  // Обрабатываем Set
  if (value instanceof Set) {
    const cloned = new Set();

    hash.set(value, cloned);

    value.forEach(val => {
      cloned.add(clone(val, hash));
    });

    return cloned as T;
  }

  // Обрабатываем ArrayBuffer
  if (value instanceof ArrayBuffer) {
    const cloned = value.slice(0);

    hash.set(value, cloned);

    return cloned as T;
  }

  // Рекурсивное клонирование для массивов
  if (Array.isArray(value)) {
    const cloned: Array<unknown> = [];

    hash.set(value, cloned);

    for (let i = 0; i < value.length; i++) {
      cloned[i] = clone(value[i], hash);
    }

    return cloned as T;
  }

  // Обрабатываем обычные объекты
  if (isObject(value)) {
    // Создаем объект с правильным прототипом
    const cloned = Object.create(Object.getPrototypeOf(value));

    hash.set(value, cloned);

    // Копируем все свойства (включая символы и неперечислимые)
    const allKeys = [
      ...Object.getOwnPropertyNames(value),
      ...Object.getOwnPropertySymbols(value)
    ];

    for (const key of allKeys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);

      if (descriptor) {
        if ('value' in descriptor) {
          // Копируем значение
          Object.defineProperty(cloned, key, {
            ...descriptor,
            value: clone(descriptor.value, hash)
          });
        } else {
          // Копируем геттеры/сеттеры
          Object.defineProperty(cloned, key, descriptor);
        }
      }
    }

    return cloned as T;
  }

  // Экземпляр класса, Object.create(null) и прочие объекты без своей ветки — та же ссылка.
  return value;
}
