import type { Maybe, MaybeNull } from '../../../types';
import type { FormRootContext, FormItemProps, FormModelValues, FormItemInstance, FormModel, FormRules } from '../types';
import { useFormField } from './useFormField';
import { useFormItemValidation } from './useFormItemValidation';
import { debounce } from '../../../utils';
import { z, type ZodType } from 'zod';
import { computed, type MaybeRefOrGetter, onMounted, onUnmounted, toValue, useId, watch } from 'vue';

export interface UseFormItemOptions {
  formRootContext: MaybeNull<FormRootContext>;
  props: MaybeRefOrGetter<FormItemProps>;
  el?: MaybeRefOrGetter<MaybeNull<HTMLElement>>;
  onValid?: VoidFunction;
  onInvalid?: VoidFunction;
}

export function useFormItem (options: UseFormItemOptions) {
  const id = useId();

  const { field, registerField, unregisterField } = useFormField();

  const props = computed<FormItemProps>(() => toValue(options.props));

  const name = computed<Maybe<string>>(() => props.value.name);

  const modelValue = computed<Maybe<FormModel>>(() => options.formRootContext?.modelValue.value);

  const rules = computed<Maybe<FormRules<FormModel>>>(() => options.formRootContext?.props?.rules);

  const value = computed<FormModelValues>(() => {
    if (!name.value || !modelValue.value) {
      return undefined;
    }

    return modelValue.value[name.value];
  });

  /**
   * Disabled формы, FormItem или зарегистрированного контрола (например VInput disabled).
   */
  const isDisabled = computed<boolean>(() => {
    return Boolean(
      options.formRootContext?.props.disabled ||
      props.value?.disabled ||
      toValue(field.value?.isDisabled)
    );
  });

  const rule = computed<MaybeNull<ZodType>>(() => {
    if (!name.value || !rules.value) {
      return null;
    }

    const ruleValue = rules.value[name.value];

    return ruleValue instanceof z.ZodType ? ruleValue : null;
  });

  const isValidatable = computed<boolean>(() => Boolean(rule.value) && !isDisabled.value);

  const isRequired = computed<boolean>(() => {
    if (!rule.value || isDisabled.value) {
      return false;
    }

    return !rule.value.safeParse(undefined).success;
  });

  const {
    isFieldValid,
    validationStatus,
    validationErrors,
    clearValidateErrors: clearFieldValidateErrors,
    validate: validateField
  } = useFormItemValidation({
    data: () => {
      if (!name.value) {
        return null;
      }

      return ({
        [name.value]: value.value
      });
    },
    schema: () => {
      if (!name.value || !rule.value) {
        return null;
      }

      return z.object({
        [name.value]: rule.value
      });
    },
    onValid: () => {
      options.onValid?.();
    },
    onInvalid: () => {
      options.onInvalid?.();
    }
  });

  /**
   * Disabled-поле не участвует в валидации и не блокирует форму.
   */
  async function validate (silent = false): Promise<boolean> {
    if (isDisabled.value) {
      return true;
    }

    return validateField(silent);
  }

  /**
   * Сброс UI-статуса валидации поля.
   */
  function reset () {
    clearValidateErrors();
  }

  const debouncedValidate = debounce(() => {
    if (!isValidatable.value) {
      return;
    }

    void validate();
  }, 300);

  function clearValidateErrors () {
    debouncedValidate.cancel();
    clearFieldValidateErrors();
  }

  /**
   * Стабильный handle в реестре формы: геттеры читают актуальные ref
   */
  const instance: FormItemInstance = {
    id,
    get props () {
      return props.value;
    },
    get isValidatable () {
      return isValidatable.value;
    },
    get isFieldValid () {
      return isFieldValid.value;
    },
    get isRequired () {
      return isRequired.value;
    },
    get el () {
      return toValue(options.el) ?? null;
    },
    validate,
    reset,
    clearValidateErrors
  };

  /** Тихий parse — обновить isFieldValid без показа ошибок (для isValid кнопки). */
  function validateSilent () {
    if (!isValidatable.value) {
      return;
    }

    void validate(true);
  }

  onMounted(() => {
    options.formRootContext?.registerFormItem(instance);
    validateSilent();
  });

  onUnmounted(() => {
    debouncedValidate.cancel();
    options.formRootContext?.unregisterFormItem(id);
  });

  watch(value, () => {
    if (!isValidatable.value) {
      return;
    }

    debouncedValidate();
  });

  watch(isValidatable, (validatable, wasValidatable) => {
    if (validatable && !wasValidatable) {
      validateSilent();

      return;
    }

    if (!validatable) {
      clearValidateErrors();
    }
  });

  return {
    id,
    isFieldValid,
    validationErrors,
    validationStatus,
    isDisabled,
    isRequired,
    reset,
    validate,
    clearValidateErrors,
    registerField,
    unregisterField,
  };
}
