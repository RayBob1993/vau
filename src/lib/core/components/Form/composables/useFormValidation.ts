import type { FormItemInstance, FormRootValidationResult } from '../types';
import { takeLatest } from '../../../utils';
import { computed, onScopeDispose, toValue, type MaybeRefOrGetter } from 'vue';

export interface UseFormValidationOptions {
  formItems: MaybeRefOrGetter<Array<FormItemInstance>>;
  onValid?: VoidFunction;
  onInvalid?: VoidFunction;
}

export function useFormValidation (options: UseFormValidationOptions) {
  const formItems = computed<Array<FormItemInstance>>(() => toValue(options.formItems));

  const validatableFormItems = computed<Array<FormItemInstance>>(() => formItems.value.filter(formItem => formItem.isValidatable));

  /**
   * Агрегация validate полей: колбэки onValid/onInvalid — только у последнего
   * и только «громкого» прогона (silent нужен для isValid и не должен эмитить события).
   */
  const validateLatest = takeLatest(async (silent: boolean): Promise<boolean> => {
    const validationPromises = await Promise.all(
      validatableFormItems.value.map(formItem => formItem.validate(silent))
    );

    return validationPromises.every(Boolean);
  });

  async function validate (silent = false): Promise<FormRootValidationResult> {
    const { value: isValid, isLatest } = await validateLatest(silent);

    if (!isLatest || silent) {
      return { isValid, isLatest };
    }

    if (isValid) {
      options.onValid?.();
    } else {
      options.onInvalid?.();
    }

    return {
      isValid,
      isLatest
    };
  }

  function clearValidate () {
    validateLatest.cancel();
    formItems.value.forEach(formItem => formItem.clearValidateErrors());
  }

  onScopeDispose(() => {
    validateLatest.cancel();
  });

  return {
    validatableFormItems,
    validate,
    clearValidate
  };
}
