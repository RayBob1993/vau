import type { CheckboxProps, CheckboxModelValue } from '../types';
import type { FormRootContext, FormItemContext } from '../../Form';
import type { MaybeNull, Maybe } from '../../../types';
import { isBoolean } from '../../../utils';
import { computed, type MaybeRefOrGetter, onMounted, onUnmounted, toValue } from 'vue';

export interface UseCheckboxRootOptions {
  formRootContext: MaybeNull<FormRootContext>;
  formItemContext: MaybeNull<FormItemContext>;
  props: MaybeRefOrGetter<CheckboxProps>;
  modelValue: MaybeRefOrGetter<Maybe<CheckboxModelValue>>;
  onUpdateModelValue?: (value: CheckboxModelValue) => void;
}

export function useCheckboxRoot (options: UseCheckboxRootOptions) {
  const props = computed<CheckboxProps>(() => toValue(options.props));

  const modelValue = computed<Maybe<CheckboxModelValue>>(() => toValue(options.modelValue));

  const isDisabled = computed<boolean>(() => {
    return Boolean(
      options.formRootContext?.props.disabled ||
      options.formItemContext?.props.disabled ||
      props.value?.disabled
    );
  });

  const isActive = computed<boolean>(() => {
    if (isBoolean(modelValue.value)) {
      return modelValue.value;
    }

    if (props.value.value && Array.isArray(modelValue.value)) {
      return modelValue.value.includes(props.value.value);
    }

    return false;
  });

  const isChecked = computed<boolean>(() => Boolean(isActive.value || props.value?.checked));

  const isIndeterminate = computed<boolean>(() => Boolean(props.value?.indeterminate));

  function reset () {
    if (Array.isArray(modelValue.value)) {
      options.onUpdateModelValue?.([]);

      return;
    }

    options.onUpdateModelValue?.(false);
  }

  onMounted(() => {
    options.formItemContext?.registerField({
      reset,
      /**
       * Для групп чекбоксов disabled отдельной опции не должен отключать валидацию всего FormItem.
       * Исключение из валидации — через disabled на FormItem/Form или на единственном boolean-чекбоксе.
       */
      isDisabled: () => {
        if (Array.isArray(modelValue.value)) {
          return false;
        }

        return Boolean(props.value?.disabled);
      }
    });
  });

  onUnmounted(() => {
    options.formItemContext?.unregisterField();
  });

  return {
    isActive,
    isDisabled,
    isChecked,
    isIndeterminate
  };
}
