import { isBeforeInDocument } from '../isBeforeInDocument';
import { afterEach, describe, expect, it } from 'vitest';

describe('isBeforeInDocument', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('порядок соседей и вложенных узлов', () => {
    document.body.innerHTML = '<div id="a"><span id="a1"></span></div><div id="b"></div>';

    const a = document.getElementById('a')!;
    const a1 = document.getElementById('a1')!;
    const b = document.getElementById('b')!;

    expect(isBeforeInDocument(a, b)).toBe(true);
    expect(isBeforeInDocument(b, a)).toBe(false);
    /* родитель раньше своего потомка, потомок раньше следующего соседа родителя */
    expect(isBeforeInDocument(a, a1)).toBe(true);
    expect(isBeforeInDocument(a1, b)).toBe(true);
  });

  it('один и тот же узел — false', () => {
    document.body.innerHTML = '<div id="a"></div>';

    const a = document.getElementById('a')!;

    expect(isBeforeInDocument(a, a)).toBe(false);
  });
});
