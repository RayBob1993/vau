import { throttle } from '../throttle';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('выполняет первый вызов сразу', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled('a');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a');
  });

  it('не вызывает callback повторно внутри окна delay', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled('a');
    throttled('b');
    throttled('c');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a');
  });

  it('выполняет trailing-вызов с последними аргументами', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled('a');
    throttled('b');
    throttled('c');

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, 'a');
    expect(callback).toHaveBeenNthCalledWith(2, 'c');
  });

  it('noTrailing отключает отложенный вызов', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100, {
      noTrailing: true
    });

    throttled('a');
    throttled('b');

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a');
  });

  it('noLeading откладывает первый вызов', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100, {
      noLeading: true
    });

    throttled('a');

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a');
  });

  it('cancel отменяет запланированный вызов', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled('a');
    throttled('b');
    throttled.cancel();

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a');
  });

  it('после cancel с upcomingOnly=false игнорирует новые вызовы', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled('a');
    throttled.cancel();
    throttled('b');

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a');
  });
});
