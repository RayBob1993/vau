import { debounce } from '../debounce';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('вызывает callback один раз после паузы с последними аргументами', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100);

    debounced('a');
    debounced('b');
    debounced('c');

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('c');
  });

  it('сбрасывает таймер при каждом новом вызове', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100);

    debounced('a');
    vi.advanceTimersByTime(60);

    debounced('b');
    vi.advanceTimersByTime(60);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(40);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('b');
  });

  it('atBegin вызывает callback сразу при первом вызове', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100, {
      atBegin: true
    });

    debounced('a');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a');

    debounced('b');
    debounced('c');

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancel отменяет отложенный вызов', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100);

    debounced('a');
    debounced.cancel();

    vi.advanceTimersByTime(100);

    expect(callback).not.toHaveBeenCalled();
  });
});
