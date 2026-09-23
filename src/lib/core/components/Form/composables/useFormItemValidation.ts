import type { FormItemError, FormItemValidationStatus, FormValidationResult, FormModel } from '../types';
import type { ZodObject } from 'zod';
import type { MaybeNull } from '../../../types';
import { createRuleExceptionIssue } from '../utils';
import { useToggle } from '../../../composables';
import { takeLatest } from '../../../utils';
import { type MaybeRefOrGetter, type Ref, computed, onScopeDispose, ref, toValue } from 'vue';

export interface UseFormItemValidationOptions {
  data: MaybeRefOrGetter<MaybeNull<FormModel>>;
  schema: MaybeRefOrGetter<MaybeNull<ZodObject>>;
  onValid?: VoidFunction;
  onInvalid?: VoidFunction;
}

export interface UseFormItemValidationReturn {
  /** Логический результат последнего parse (для агрегации Form.isValid). */
  isFieldValid: Ref<boolean>;
  validationStatus: Ref<FormItemValidationStatus>;
  validationErrors: Ref<Array<FormItemError>>;
  /** Сброс UI-статуса и ошибок; `isFieldValid` не меняется. */
  clearValidateErrors: VoidFunction;
  validate: (silent?: boolean) => FormValidationResult;
}

type ParseResult =
  | { ok: true; }
  | { ok: false; issues: Array<FormItemError>; };

export function useFormItemValidation (options: UseFormItemValidationOptions): UseFormItemValidationReturn {
  const data = computed<MaybeNull<FormModel>>(() => toValue(options.data));
  const schema = computed<MaybeNull<ZodObject>>(() => toValue(options.schema));

  const [isFieldValid, setIsFieldValid] = useToggle(false);

  const validationStatus = ref<FormItemValidationStatus>({
    isError: false,
    isValidating: false,
    isSuccess: false
  });

  const validationErrors = ref<Array<FormItemError>>([]);

  function setValidationStatus (partial: Partial<FormItemValidationStatus>) {
    validationStatus.value = { ...validationStatus.value, ...partial };
  }

  /**
   * Чистый parse без записи в UI — side effects только при isLatest.
   *
   * Исключение из правила (`throw` в refine, упавший запрос в async-refine) `safeParseAsync`
   * не ловит. Здесь оно превращается в невалидный результат с одной ошибкой — иначе
   * `isValidating` зависнет, `validate()`/`submit()` отклонятся, а `void validate()` даст unhandled rejection.
   */
  const parseLatest = takeLatest(async (): Promise<ParseResult | null> => {
    if (!data.value || !schema.value) {
      return null;
    }

    try {
      const result = await schema.value.safeParseAsync(data.value);

      if (result.success) {
        return { ok: true };
      }

      return {
        ok: false,
        issues: result.error.issues
      };
    } catch (error) {
      console.error(`[vau Form] Исключение в правиле поля "${Object.keys(data.value).join(', ')}":`, error);

      return {
        ok: false,
        issues: [createRuleExceptionIssue(data.value)]
      };
    }
  });

  /**
   * Только UI: ошибки и статус. `isFieldValid` не трогаем — иначе форма
   * становится невалидной до следующего ввода. Актуализирует его вызывающий (silent parse).
   */
  function clearValidateErrors () {
    parseLatest.cancel();
    validationErrors.value = [];

    setValidationStatus({
      isError: false,
      isSuccess: false,
      isValidating: false
    });
  }

  async function validate (silent = false): Promise<boolean> {
    if (!data.value) {
      setIsFieldValid(false);

      return false;
    }

    if (!schema.value) {
      setIsFieldValid(false);

      return false;
    }

    setValidationStatus({ isValidating: true });

    const { value: parsed, isLatest } = await parseLatest();

    if (!isLatest) {
      if (!parseLatest.isPending()) {
        setValidationStatus({ isValidating: false });
      }

      /* Результат этого запуска для агрегации / Promise.all; UI не трогаем. */
      return parsed?.ok === true;
    }

    setValidationStatus({ isValidating: false });

    if (parsed === null) {
      setIsFieldValid(false);

      return false;
    }

    if (parsed.ok) {
      setIsFieldValid(true);
      validationErrors.value = [];
      setValidationStatus({ isError: false });

      /* Silent обновляет только isFieldValid: без UI-успеха и без события valid. */
      if (silent) {
        return true;
      }

      setValidationStatus({ isSuccess: true });
      options.onValid?.();

      return true;
    }

    setIsFieldValid(false);

    /* Silent fail: логика невалидна, зелёный UI сбрасываем; ошибки и событие invalid — нет. */
    if (silent) {
      setValidationStatus({ isSuccess: false });

      return false;
    }

    setValidationStatus({ isError: true, isSuccess: false });
    validationErrors.value = parsed.issues;
    options.onInvalid?.();

    return false;
  }

  onScopeDispose(() => {
    parseLatest.cancel();
  });

  return {
    isFieldValid,
    validationStatus,
    validationErrors,
    clearValidateErrors,
    validate
  };
}
