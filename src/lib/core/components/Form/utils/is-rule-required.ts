import type { ZodType } from 'zod';

/**
 * Поле обязательно, если `undefined` не проходит схему.
 *
 * Схему с async-refine нельзя прогнать синхронно (`$ZodAsyncError`), а refine может
 * и бросить исключение — в обоих случаях смотрим на обёртку: `optional()` / `default()`
 * принимают `undefined` на входе (`optin`), всё остальное считаем обязательным.
 * Исключение из computed уронило бы рендер FormItem.
 */
export function isRuleRequired (rule: ZodType): boolean {
  try {
    return !rule.safeParse(undefined).success;
  } catch {
    return !rule._zod.optin;
  }
}
