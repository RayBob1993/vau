import { useClipboard } from '../useClipboard';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, ref } from 'vue';

describe('useClipboard', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockClear();

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText
      }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('isSupported=true при наличии clipboard.writeText', () => {
    const { isSupported } = useClipboard();

    expect(isSupported.value).toBe(true);
  });

  it('copy записывает текст и выставляет text/copied', async () => {
    const { copy, text, copied } = useClipboard({
      copiedDuring: 1000
    });

    const result = await copy('hello');

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(text.value).toBe('hello');
    expect(copied.value).toBe(true);

    vi.advanceTimersByTime(1000);

    expect(copied.value).toBe(false);
  });

  it('copy() без аргумента берёт source', async () => {
    const source = ref('from-source');
    const { copy, text } = useClipboard({
      source
    });

    await copy();

    expect(writeText).toHaveBeenCalledWith('from-source');
    expect(text.value).toBe('from-source');
  });

  it('пустой текст возвращает false без вызова API', async () => {
    const { copy, copied } = useClipboard();

    const result = await copy('');

    expect(result).toBe(false);
    expect(writeText).not.toHaveBeenCalled();
    expect(copied.value).toBe(false);
  });

  it('isSupported=false без Clipboard API', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined
    });

    const { isSupported, copy } = useClipboard();

    expect(isSupported.value).toBe(false);
    expect(await copy('text')).toBe(false);
  });

  it('очищает таймер copied при unmount', async () => {
    const scope = effectScope();
    const clipboard = scope.run(() => useClipboard({
      copiedDuring: 5000
    }));

    expect(clipboard).toBeDefined();

    if (!clipboard) {
      return;
    }

    await clipboard.copy('keep');

    expect(clipboard.copied.value).toBe(true);

    scope.stop();
    vi.advanceTimersByTime(5000);

    expect(clipboard.copied.value).toBe(true);
  });
});
