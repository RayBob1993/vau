import type { MaybeNull } from '../../types';
import { isUndefined } from '../isUndefined';

export interface ThrottleOptions {
  /**
   * Если установлено в true, то вызов функции после окончания периода ожидания не будет выполнен.
   * @default false
   */
  noTrailing?: boolean;

  /**
   * Если установлено в true, то первый вызов функции внутри периода ожидания не будет выполнен.
   * @default false
   */
  noLeading?: boolean;

  /**
   * Если установлено в true, то функция будет работать в режиме debounce.
   * @default undefined
   */
  debounceMode?: boolean;
}

export interface CancelOptions {
  /**
   * Если установлено в true, то только запланированный вызов будет отменен, а текущий выполнится.
   * @default false
   */
  upcomingOnly?: boolean;
}

export interface ThrottledFunction <T extends Array<unknown>> {
  (...args: T): void;
  cancel: (options?: CancelOptions) => void;
}

/**
 * @description `throttle` - Ограничивает частоту вызова функции, позволяя ей выполняться не чаще, чем один раз в указанный период времени.
 *
 * https://github.com/niksy/throttle-debounce/blob/master/throttle.js
 *
 * @template T - Тип функции, которую нужно ограничить.
 * @param {T} callback - Функция, вызов которой нужно ограничить.
 * @param {number} delay - Период времени в миллисекундах, в течение которого функция может быть вызвана только один раз.
 * @param {ThrottleOptions} [options={}] - Опции для настройки поведения функции throttle.
 * @returns {(...args: Parameters<T>) => void} - Обертка вокруг оригинальной функции, которая ограничивает её вызовы.
 *
 * @example
 * const throttledFn = throttle(() => console.log('Throttled'), 1000);
 * window.addEventListener('resize', throttledFn);
 */
export function throttle <T extends Array<unknown>> (
  callback: (...args: T) => unknown,
  delay: number,
  options: ThrottleOptions = {}
): ThrottledFunction<T> {
  const {
    noTrailing = false,
    noLeading = false,
    debounceMode = undefined
  } = options;

  let timeoutID: MaybeNull<NodeJS.Timeout> = null;
  let cancelled = false;
  let lastExec = 0;

  // Для сохранения последних аргументов
  let lastArgs: MaybeNull<T> = null;

  function clearExistingTimeout () {
    if (timeoutID) {
      clearTimeout(timeoutID);
      timeoutID = null;
    }
  }

  function cancel (options: CancelOptions = {}) {
    const { upcomingOnly = false } = options;

    clearExistingTimeout();
    cancelled = !upcomingOnly;
  }

  // Функция для выполнения callback
  function exec (this: unknown) {
    lastExec = Date.now();

    if (lastArgs) {
      // Сохраняем аргументы и контекст перед вызовом
      const args = lastArgs;

      callback.apply(this, args);
      lastArgs = null;
    }
  }

  function wrapper (this: unknown, ...arguments_: T) {
    if (cancelled) {
      return;
    }

    const elapsed = Date.now() - lastExec;

    // Сохраняем аргументы для следующего вызова
    lastArgs = arguments_;

    function clear () {
      timeoutID = null;
    }

    // atBegin срабатывает только пока нет активного таймера.
    // clearExistingTimeout обнуляет timeoutID, поэтому проверка идёт раньше.
    if (!noLeading && debounceMode && !timeoutID) {
      exec.call(this);
    }

    clearExistingTimeout();

    // Основная логика throttle
    if (isUndefined(debounceMode) && elapsed > delay) {
      if (noLeading) {
        lastExec = Date.now();

        if (!noTrailing) {
          timeoutID = setTimeout(debounceMode ? clear : exec.bind(this), delay);
        }
      } else {
        exec.call(this);
      }
    } else if (!noTrailing) {
      // Используем bind для сохранения контекста и аргументов
      timeoutID = setTimeout(
        debounceMode ? clear : exec.bind(this),
        isUndefined(debounceMode) ? delay - elapsed : delay
      );
    }
  }

  wrapper.cancel = cancel;

  return wrapper;
}
