import { takeLatest } from '../takeLatest';
import { delay } from '../../delay';
import { describe, expect, it, vi } from 'vitest';

describe('takeLatest', () => {
  it('isLatest=true только у последнего вызова', async () => {
    const parse = takeLatest(async (value: string) => {
      await delay(value === 'slow' ? 50 : 10);

      return value;
    });

    const first = parse('slow');
    const second = parse('fast');

    await expect(first).resolves.toEqual({
      value: 'slow',
      isLatest: false
    });
    await expect(second).resolves.toEqual({
      value: 'fast',
      isLatest: true
    });
  });

  it('cancel делает in-flight isLatest=false', async () => {
    const parse = takeLatest(async () => {
      await delay(30);

      return 'done';
    });

    const pending = parse();

    parse.cancel();

    await expect(pending).resolves.toEqual({
      value: 'done',
      isLatest: false
    });
  });

  it('isPending отражает незавершённые вызовы', async () => {
    const parse = takeLatest(async () => {
      await delay(20);

      return true;
    });

    expect(parse.isPending()).toBe(false);

    const pending = parse();

    expect(parse.isPending()).toBe(true);

    await pending;

    expect(parse.isPending()).toBe(false);
  });

  it('side effects применяются только для isLatest', async () => {
    const apply = vi.fn();

    const run = takeLatest(async (value: number) => {
      await delay(value === 1 ? 40 : 5);

      return value;
    });

    const first = run(1).then(({ value, isLatest }) => {
      if (isLatest) {
        apply(value);
      }
    });

    const second = run(2).then(({ value, isLatest }) => {
      if (isLatest) {
        apply(value);
      }
    });

    await Promise.all([first, second]);

    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith(2);
  });
});
