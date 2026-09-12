/**
 * Результат вызова takeLatest: значение всегда от этого запуска,
 * `isLatest` — нужно ли применять side effects (только последний вызов).
 */
export interface TakeLatestResult <TResult> {
  value: TResult;
  isLatest: boolean;
}

export interface TakeLatestFunction <TArgs extends Array<unknown>, TResult> {
  (...args: TArgs): Promise<TakeLatestResult<TResult>>;
  /**
   * Инвалидирует текущий in-flight вызов (все незавершённые получат isLatest: false).
   */
  cancel: VoidFunction;
  /**
   * Есть ли ещё незавершённые вызовы.
   */
  isPending: () => boolean;
}

/**
 * @description `takeLatest` — паттерн как Redux-Saga `takeLatest` / RxJS `switchMap` (без отмены работы).
 *
 * Каждый вызов выполняет callback и возвращает свой `value`.
 * `isLatest === true` только у последнего поколения — side effects (UI) применять только тогда.
 * Так `Promise.all` на форме получает честный результат каждого вызова, без ложного `false` из‑за гонки.
 *
 * @example
 * const parse = takeLatest(async (value: string) => schema.safeParseAsync(value));
 *
 * const first = parse('a');
 * const second = parse('b');
 * const a = await first; // { value, isLatest: false }
 * const b = await second; // { value, isLatest: true }
 */
export function takeLatest <TArgs extends Array<unknown>, TResult> (
  callback: (...args: TArgs) => Promise<TResult>
): TakeLatestFunction<TArgs, TResult> {
  let generation = 0;
  let pending = 0;

  const wrapped = (async (...args: TArgs): Promise<TakeLatestResult<TResult>> => {
    const current = ++generation;

    pending++;

    try {
      const value = await callback(...args);

      return {
        value,
        isLatest: current === generation
      };
    } finally {
      pending--;
    }
  }) as TakeLatestFunction<TArgs, TResult>;

  wrapped.cancel = () => {
    generation++;
  };

  wrapped.isPending = () => pending > 0;

  return wrapped;
}
