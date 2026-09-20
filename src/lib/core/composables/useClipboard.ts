import type { Maybe } from '../types';
import { isUndefined, isFunction } from '../utils';
import {
  computed,
  getCurrentScope,
  onScopeDispose,
  ref,
  toValue,
  type MaybeRefOrGetter
} from 'vue';

export interface UseClipboardOptions {
  /** Текст по умолчанию для `copy()` без аргумента. */
  source?: MaybeRefOrGetter<string>;
  /** Сколько мс держать `copied === true` (по умолчанию 1500). */
  copiedDuring?: number;
}

const DEFAULT_COPIED_DURING = 1500;

function hasClipboardWrite (): boolean {
  const clipboard = globalThis.navigator?.clipboard;

  if (isUndefined(clipboard)) {
    return false;
  }

  return isFunction(Reflect.get(clipboard, 'writeText'));
}

/**
 * Реактивный Clipboard API: копирование текста в буфер обмена.
 *
 * @example
 * ```ts
 * const source = ref('Hello');
 * const { copy, copied, isSupported } = useClipboard({ source });
 *
 * await copy();        // из source
 * await copy('World'); // явный текст
 * ```
 */
export function useClipboard (options: UseClipboardOptions = {}) {
  const {
    source,
    copiedDuring = DEFAULT_COPIED_DURING
  } = options;

  const text = ref<string>('');
  const copied = ref<boolean>(false);

  let resetCopiedTimer: Maybe<ReturnType<typeof setTimeout>>;

  const isSupported = computed<boolean>(() => hasClipboardWrite());

  function clearResetCopiedTimer () {
    if (isUndefined(resetCopiedTimer)) {
      return;
    }

    clearTimeout(resetCopiedTimer);
    resetCopiedTimer = undefined;
  }

  function markCopied () {
    copied.value = true;
    clearResetCopiedTimer();

    resetCopiedTimer = setTimeout(() => {
      copied.value = false;
      resetCopiedTimer = undefined;
    }, copiedDuring);
  }

  async function write (value: string): Promise<boolean> {
    const clipboard = globalThis.navigator?.clipboard;

    if (isUndefined(clipboard) || !isFunction(Reflect.get(clipboard, 'writeText'))) {
      return false;
    }

    try {
      await clipboard.writeText(value);

      return true;
    } catch {
      return false;
    }
  }

  async function copy (value?: string): Promise<boolean> {
    const payload = value ?? toValue(source);

    if (!payload) {
      return false;
    }

    const success = await write(payload);

    if (!success) {
      return false;
    }

    text.value = payload;
    markCopied();

    return true;
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      clearResetCopiedTimer();
    });
  }

  return {
    isSupported,
    text,
    copied,
    copy
  };
}
