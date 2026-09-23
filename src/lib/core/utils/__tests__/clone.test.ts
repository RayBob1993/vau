import { clone } from '../clone';
import { describe, expect, it } from 'vitest';

/** Чтение поля дескриптора без ссылки на метод: `get` в типе PropertyDescriptor — метод. */
function readDescriptorField (descriptor: PropertyDescriptor | undefined, field: 'get' | 'value'): unknown {
  if (!descriptor) {
    return undefined;
  }

  return ({ ...descriptor } as Record<string, unknown>)[field];
}

describe('clone', () => {
  describe('примитивы и функции', () => {
    it('возвращает ту же ссылку', () => {
      const greet = () => 'hi';
      const token = Symbol('token');

      expect(clone(1)).toBe(1);
      expect(clone('a')).toBe('a');
      expect(clone(true)).toBe(true);
      expect(clone(false)).toBe(false);
      expect(clone(null)).toBeNull();
      expect(clone(undefined)).toBeUndefined();
      expect(clone(Infinity)).toBe(Infinity);
      expect(Object.is(clone(NaN), NaN)).toBe(true);
      expect(Object.is(clone(-0), -0)).toBe(true);
      expect(clone(10n)).toBe(10n);
      expect(clone(token)).toBe(token);
      expect(clone(greet)).toBe(greet);
    });

    it('возвращает boxed String и Number той же ссылкой', () => {
      const text = new String('a');
      const amount = new Number(5);

      expect(clone(text)).toBe(text);
      expect(clone(amount)).toBe(amount);
    });
  });

  describe('Date', () => {
    it('копирует момент времени отдельным экземпляром', () => {
      const at = new Date('2020-01-01T00:00:00.000Z');
      const copy = clone(at);

      expect(copy).not.toBe(at);
      expect(copy.getTime()).toBe(at.getTime());

      copy.setUTCFullYear(2021);

      expect(at.getUTCFullYear()).toBe(2020);
    });
  });

  describe('RegExp', () => {
    it('копирует source и flags', () => {
      const source = /ab+/gi;
      const copy = clone(source);

      expect(copy).not.toBe(source);
      expect(copy.source).toBe('ab+');
      expect(copy.flags).toBe('gi');
    });

    it('один и тот же RegExp внутри объекта клонируется один раз', () => {
      const pattern = /a/g;
      const source = { left: pattern, right: pattern };
      const copy = clone(source);

      expect(copy.left).toBe(copy.right);
      expect(copy.left).not.toBe(pattern);
    });
  });

  describe('Map', () => {
    it('глубоко копирует ключи и значения', () => {
      const key = { id: 1 };
      const value = { n: 2 };
      const source = new Map([[key, value]]);
      const copy = clone(source);
      const [copiedKey, copiedValue] = [...copy.entries()][0]!;

      expect(copy).not.toBe(source);
      expect(copiedKey).not.toBe(key);
      expect(copiedKey).toEqual({ id: 1 });
      expect(copiedValue).not.toBe(value);
      expect(copiedValue).toEqual({ n: 2 });

      copiedValue.n = 3;

      expect(value.n).toBe(2);
    });

    it('сохраняет циклическую ссылку на саму Map', () => {
      const source = new Map<string, unknown>();

      source.set('self', source);

      const copy = clone(source);

      expect(copy).not.toBe(source);
      expect(copy.get('self')).toBe(copy);
    });
  });

  describe('Set', () => {
    it('глубоко копирует значения', () => {
      const item = { n: 1 };
      const source = new Set<unknown>([item, 1]);
      const copy = clone(source);
      const values = [...copy];

      expect(copy).not.toBe(source);
      expect(values[0]).not.toBe(item);
      expect(values[0]).toEqual({ n: 1 });
      expect(values[1]).toBe(1);
    });

    it('сохраняет циклическую ссылку на сам Set', () => {
      const source = new Set<unknown>();

      source.add(source);

      const copy = clone(source);

      expect(copy).not.toBe(source);
      expect(copy.has(copy)).toBe(true);
    });
  });

  describe('ArrayBuffer', () => {
    it('копирует байты отдельным буфером', () => {
      const source = new ArrayBuffer(4);

      new Uint8Array(source)[0] = 7;

      const copy = clone(source);

      expect(copy).not.toBe(source);
      expect(new Uint8Array(copy)[0]).toBe(7);

      new Uint8Array(copy)[0] = 9;

      expect(new Uint8Array(source)[0]).toBe(7);
    });
  });

  describe('массив', () => {
    it('глубоко копирует элементы', () => {
      const nested = { n: 1 };
      const inner = [2];
      const source = [nested, inner];
      const copy = clone(source);
      const copiedNested = copy[0];

      expect(copy).not.toBe(source);
      expect(copiedNested).not.toBe(nested);
      expect(copiedNested).toEqual({ n: 1 });
      expect(copy[1]).not.toBe(inner);
      expect(copy[1]).toEqual([2]);

      if (!copiedNested || Array.isArray(copiedNested)) {
        throw new Error('Ожидался скопированный объект');
      }

      copiedNested.n = 3;
      copy.push(nested);

      expect(nested.n).toBe(1);
      expect(source).toHaveLength(2);
    });

    it('один и тот же массив внутри объекта клонируется один раз', () => {
      const items = [1];
      const source = { left: items, right: items };
      const copy = clone(source);

      expect(copy.left).toBe(copy.right);
      expect(copy.left).not.toBe(items);
    });

    it('сохраняет циклическую ссылку', () => {
      const source: Array<unknown> = [];

      source.push(source);

      const copy = clone(source);

      expect(copy).not.toBe(source);
      expect(copy[0]).toBe(copy);
    });
  });

  describe('обычный объект', () => {
    it('глубоко копирует поля, символы и неперечислимые свойства', () => {
      const secret = Symbol('secret');
      const source = {
        name: 'Дима',
        nested: { n: 1 },
        [secret]: 2
      };

      Object.defineProperty(source, 'hidden', {
        value: 3,
        enumerable: false,
        writable: true,
        configurable: true
      });

      const copy = clone(source);

      expect(copy).not.toBe(source);
      expect(copy.nested).not.toBe(source.nested);
      expect(copy.nested).toEqual({ n: 1 });
      expect(copy[secret]).toBe(2);
      expect(copy).toHaveProperty('hidden', 3);
      expect(Object.keys(copy)).not.toContain('hidden');

      copy.name = 'Вася';
      copy.nested.n = 4;

      expect(source.name).toBe('Дима');
      expect(source.nested.n).toBe(1);
    });

    it('вызывает метод на копии, оставляя ту же функцию', () => {
      const source = {
        name: 'Дима',
        greet () {
          return this.name;
        }
      };
      const copy = clone(source);

      copy.name = 'Вася';

      expect(readDescriptorField(Object.getOwnPropertyDescriptor(copy, 'greet'), 'value')).toBe(
        readDescriptorField(Object.getOwnPropertyDescriptor(source, 'greet'), 'value')
      );
      expect(copy.greet()).toBe('Вася');
      expect(source.greet()).toBe('Дима');
    });

    it('копирует геттер и сеттер как есть, но пишет в копию', () => {
      const source = {
        _x: 1,
        get x () {
          return this._x;
        },
        set x (value: number) {
          this._x = value;
        }
      };
      const copy = clone(source);

      copy.x = 2;

      expect(copy.x).toBe(2);
      expect(source.x).toBe(1);
      expect(readDescriptorField(Object.getOwnPropertyDescriptor(copy, 'x'), 'get')).toBe(
        readDescriptorField(Object.getOwnPropertyDescriptor(source, 'x'), 'get')
      );
    });

    it('сохраняет циклическую ссылку', () => {
      const source: { self?: object; name: string; } = { name: 'Дима' };

      source.self = source;

      const copy = clone(source);

      expect(copy).not.toBe(source);
      expect(copy.self).toBe(copy);
      expect(copy.name).toBe('Дима');
    });

    it('копирует вложенные массив, Date, RegExp, Map, Set и ArrayBuffer', () => {
      const tags = ['a'];
      const at = new Date('2020-01-01T00:00:00.000Z');
      const pattern = /a/g;
      const dict = new Map([['k', 1]]);
      const flags = new Set(['on']);
      const buffer = new ArrayBuffer(2);
      const source = { tags, at, pattern, dict, flags, buffer };
      const copy = clone(source);

      expect(copy.tags).not.toBe(tags);
      expect(copy.tags).toEqual(['a']);
      expect(copy.at).not.toBe(at);
      expect(copy.at.getTime()).toBe(at.getTime());
      expect(copy.pattern).not.toBe(pattern);
      expect(copy.pattern.source).toBe('a');
      expect(copy.dict).not.toBe(dict);
      expect(copy.dict.get('k')).toBe(1);
      expect(copy.flags).not.toBe(flags);
      expect([...copy.flags]).toEqual(['on']);
      expect(copy.buffer).not.toBe(buffer);
      expect(copy.buffer.byteLength).toBe(2);
    });
  });

  describe('объекты без своей ветки', () => {
    it('возвращает ту же ссылку', () => {
      class User {
        name = 'Дима';
      }

      const user = new User();
      const bare = Object.create(null);
      const error = new Error('fail');
      const bytes = new Uint8Array([1, 2]);
      const flag = new Boolean(true);

      bare.a = 1;

      expect(clone(user)).toBe(user);
      expect(clone(bare)).toBe(bare);
      expect(clone(error)).toBe(error);
      expect(clone(bytes)).toBe(bytes);
      expect(clone(flag)).toBe(flag);
    });
  });
});
