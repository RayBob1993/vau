import { useFormRootContext } from './useFormRootContext';
import { useFormItemContext } from './useFormItemContext';
import { computed } from 'vue';

/**
 * Контексты формы для контролов (Input, Checkbox, Select…).
 *
 * `isSuccess` / `isError` — UI-статус поля после громкой валидации
 * (`validationStatus.isSuccess` / `isError`) для классов `--valid` / `--invalid`.
 * Логический результат парсинга — `FormItemInstance.isValid`; до первой громкой валидации оба UI-флага `false`.
 */
export function useFormContext () {
  const formRootContext = useFormRootContext();
  const formItemContext = useFormItemContext();

  const isSuccess = computed<boolean>(() => Boolean(formItemContext?.validationStatus.value.isSuccess));
  const isError = computed<boolean>(() => Boolean(formItemContext?.validationStatus.value.isError));

  return {
    formRootContext,
    formItemContext,
    isSuccess,
    isError
  };
}
