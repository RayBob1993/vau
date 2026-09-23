import type { FormItemError, FormModel } from '../types';
import { FORM_RULE_EXCEPTION_MESSAGE } from '../constants';

/**
 * Ошибка поля для исключения в правиле (`throw` в refine, упавший async-refine):
 * формат Zod-issue, чтобы UI ошибок не отличал её от обычных.
 */
export function createRuleExceptionIssue (data: FormModel): FormItemError {
  return {
    code: 'custom',
    path: Object.keys(data),
    message: FORM_RULE_EXCEPTION_MESSAGE,
    input: data
  };
}
