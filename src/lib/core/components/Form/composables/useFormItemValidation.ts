import type { FormItemError, FormItemValidationStatus, FormValidationResult, FormModel } from '../types';
import type { ZodObject } from 'zod';
import type { MaybeNull } from '../../../types';
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
   */
  const parseLatest = takeLatest(async (): Promise<ParseResult | null> => {
    if (!data.value || !schema.value) {
      return null;
    }

    const result = await schema.value.safeParseAsync(data.value);

    if (result.success) {
      return { ok: true };
    }

    return {
      ok: false,
      issues: result.error.issues
    };
  });

  function clearValidateErrors () {
    parseLatest.cancel();
    setIsFieldValid(false);
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

      /* UI-успех только при «громкой» валидации — silent нужен для isValid кнопки. */
      if (!silent) {
        setValidationStatus({ isSuccess: true });
      }

      options.onValid?.();

      return true;
    }

    setIsFieldValid(false);

    if (!silent) {
      setValidationStatus({ isError: true, isSuccess: false });
      validationErrors.value = parsed.issues;
    } else {
      /* Silent fail: логика невалидна, зелёный UI сбрасываем, ошибки не показываем. */
      setValidationStatus({ isSuccess: false });
    }

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
