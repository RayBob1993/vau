import { isFunction } from '../isFunction';
import { describe, it, expect } from 'vitest';

describe('isFunction', () => {
  it('Проверка переданных аргументов', () => {
    expect(isFunction(function () {})).toBe(true);
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(async () => {})).toBe(true);
    expect(isFunction('1')).toBe(false);
    expect(isFunction('')).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
    expect(isFunction(false)).toBe(false);
    expect(isFunction(true)).toBe(false);
  });
});
