import { isEqual } from '../isEqual';
import { describe, expect, it } from 'vitest';

describe('isEqual', () => {
  it('сравнивает примитивы', () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual('a', 'a')).toBe(true);
    expect(isEqual(1, 2)).toBe(false);
    expect(isEqual(null, null)).toBe(true);
    expect(isEqual(null, undefined)).toBe(false);
    expect(isEqual(NaN, NaN)).toBe(true);
  });

  it('сравнивает Date по времени', () => {
    expect(isEqual(new Date(1000), new Date(1000))).toBe(true);
    expect(isEqual(new Date(1000), new Date(2000))).toBe(false);
    expect(isEqual(new Date(1000), 1000)).toBe(false);
  });

  it('сравнивает массивы поэлементно', () => {
    expect(isEqual([1, 2], [1, 2])).toBe(true);
    expect(isEqual([1, 2], [2, 1])).toBe(false);
    expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(isEqual([{ a: 1 }], [{ a: 1 }])).toBe(true);
    expect(isEqual([], {})).toBe(false);
  });

  it('сравнивает объекты без учёта порядка ключей', () => {
    expect(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(isEqual({ a: { b: [1, { c: 2 }] } }, { a: { b: [1, { c: 2 }] } })).toBe(true);
    expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  });

  it('{ a: undefined } и {} — разные', () => {
    expect(isEqual({ a: undefined }, {})).toBe(false);
    expect(isEqual({ a: undefined }, { a: undefined })).toBe(true);
  });

  it('функции и экземпляры классов — по ссылке', () => {
    const fn = () => 1;

    class User {
      name = 'Дима';
    }

    expect(isEqual(fn, fn)).toBe(true);
    expect(isEqual(fn, () => 1)).toBe(false);
    expect(isEqual(new User(), new User())).toBe(false);
  });
});
