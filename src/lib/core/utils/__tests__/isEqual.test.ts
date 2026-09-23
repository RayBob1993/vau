import { isEqual } from '../isEqual';
import { describe, expect, it } from 'vitest';

describe('isEqual', () => {
  it('сравнивает примитивы', () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual('a', 'a')).toBe(true);
    expect(isEqual(1, 2)).toBe(false);
    expect(isEqual(null, null)).toBe(true);
    expect(isEqual(null, undefined)).toBe(false);
  });

  it('сравнивает объекты и массивы', () => {
    expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isEqual([1, 2], [1, 2])).toBe(true);
    expect(isEqual([1, 2], [2, 1])).toBe(false);
  });
});
