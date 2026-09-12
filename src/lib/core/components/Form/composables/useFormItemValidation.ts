import type { FormItemError, FormItemValidationStatus, FormValidationResult, FormModel } from '../types';
import type { ZodObject } from 'zod';
import type { MaybeNull } from '../../../types';
import { type MaybeRefOrGetter, type Ref, computed, ref, toValue } from 'vue';

export interface UseFormItemValidationOptions {
  data: MaybeRefOrGetter<MaybeNull<FormModel>>;
  schema: MaybeRefOrGetter<MaybeNull<ZodObject>>;
  onValid?: VoidFunction;
  onInvalid?: VoidFunction;
}

export interface UseFormItemValidationReturn {
  validationStatus: Ref<FormItemValidationStatus>;
  validationErrors: Ref<Array<FormItemError>>;
  clearValidateErrors: VoidFunction;
  validate: (silent?: boolean) => FormValidationResult;
}

export function useFormItemValidation (options: UseFormItemValidationOptions): UseFormItemValidationReturn {
  const data = computed<MaybeNull<FormModel>>(() => toValue(options.data));
  const schema = computed<MaybeNull<ZodObject>>(() => toValue(options.schema));

  const validationStatus = ref<FormItemValidationStatus>({
    isError: false,
    isValidating: false,
    isSuccess: false
  });

  const validationErrors = ref<Array<FormItemError>>([]);

  function setValidationStatus (partial: Partial<FormItemValidationStatus>) {
    validationStatus.value = { ...validationStatus.value, ...partial };
  }

  function clearValidateErrors () {
    validationErrors.value = [];

    setValidationStatus({
      isError: false,
      isSuccess: false,
      isValidating: false
    });
  }

  async function validate (silent = false): Promise<boolean> {
    if (!data.value) {
      return false;
    }

    if (!schema.value) {
      return false;
    }

    setValidationStatus({ isValidating: true });

    const result = await schema.value.safeParseAsync(data.value);

    setValidationStatus({ isValidating: false });

    if (result.success) {
      validationErrors.value = [];
      setValidationStatus({ isError: false, isSuccess: true });

      options.onValid?.();

      return true;
    } else {
      if (!silent) {
        setValidationStatus({ isError: true, isSuccess: false });

        if (result.error) {
          validationErrors.value = result.error.issues;
        }
      }

      options.onInvalid?.();

      return false;
    }
  }

  return {
    validationStatus,
    validationErrors,
    clearValidateErrors,
    validate
  };
}
