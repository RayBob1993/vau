import type { ZodError, ZodType } from 'zod';
import type { ComputedRef, DeepReadonly, MaybeRefOrGetter, ModelRef, Ref, ShallowRef, VNode } from 'vue';

export type FormModelValues = unknown;

export type FormModel = Record<string, FormModelValues>;

export type FormRules <MODEL> = {
  [K in keyof MODEL]?: ZodType<MODEL[K], MODEL[K]>;
};

export interface FormProps<MODEL> {
  rules?: FormRules<MODEL>;
  disabled?: boolean;
  scrollToError?: boolean | ScrollIntoViewOptions;
}

export interface FormSubmitEvent {
  isValid: boolean;
  reset: VoidFunction;
}

export interface FormItemEmits {
  valid: [];
  invalid: [];
}

export interface FormEmits extends FormItemEmits {
  submit: [payload: FormSubmitEvent];
}

/** Метаданные «касаемости» и отличия от initial (поле или форма). */
export interface FormMetaFlags {
  /** Значение менялось хотя бы раз (липкий флаг до reset формы). */
  isDirty: boolean;
  /** Значение никогда не меняли. */
  isPristine: boolean;
  /** Текущее значение отличается от снимка initial. */
  isChanged: boolean;
}

export interface FormValidityFlags {
  isValid: boolean;
}

export type FormScopedSlot = FormValidityFlags & FormMetaFlags & {
  isValidating: boolean;
  canSubmit: boolean;
};

export interface FormSlots {
  default?: (props: FormScopedSlot) => Array<VNode>;
}

export type FormValidationResult = Promise<boolean>;

/**
 * Результат validate на уровне формы: `undefined` — прогон устарел (takeLatest).
 */
export type FormRootValidationResult = Promise<boolean | undefined>;

export interface FormInstance {
  isValid: boolean;
  isDirty: boolean;
  isPristine: boolean;
  isChanged: boolean;
  isValidating: boolean;
  canSubmit: boolean;
  validate: (silent?: boolean) => FormValidationResult;
  clearValidate: VoidFunction;
  reset: VoidFunction;
}

export interface FormExpose {
  isValid: ComputedRef<boolean>;
  isDirty: ComputedRef<boolean>;
  isPristine: ComputedRef<boolean>;
  isChanged: ComputedRef<boolean>;
  isValidating: ComputedRef<boolean>;
  canSubmit: ComputedRef<boolean>;
  validate: (silent?: boolean) => FormValidationResult;
  clearValidate: VoidFunction;
  reset: VoidFunction;
}

export type FormItemError = ZodError['issues'][number];

export interface FormItemProps {
  disabled?: boolean;
  /**
   * Имя поля в model и rules.
   * Должно быть уникальным среди смонтированных FormItem одной формы.
   */
  name?: string;
}

export interface FormItemScopedSlot extends FormValidityFlags, FormMetaFlags {
  validationStatus: FormItemValidationStatus;
  isRequired: boolean;
  errors: Array<FormItemError>;
}

export interface FormItemSlots {
  default?: (props: FormItemScopedSlot) => Array<VNode>;
  header?: (props: FormItemScopedSlot) => Array<VNode>;
  footer?: (props: FormItemScopedSlot) => Array<VNode>;
}

export interface FormItemField {
  isDisabled?: MaybeRefOrGetter<boolean>;
}

export interface FormItemContext {
  props: FormItemProps;
  validationStatus: Ref<FormItemValidationStatus>;
  validationErrors: Ref<Array<FormItemError>>;
  registerField: (field: FormItemField) => void;
  unregisterField: VoidFunction;
  isRequired: ComputedRef<boolean>;
  isDisabled: ComputedRef<boolean>;
  validate: (silent?: boolean) => FormValidationResult;
  clearValidateErrors: VoidFunction;
  reset: VoidFunction;
}

export interface FormItemValidationStatus {
  isError: boolean;
  isValidating: boolean;
  isSuccess: boolean;
}

export interface FormItemInstance {
  id: string;
  readonly isValidatable: boolean;
  /**
   * Результат последнего parse поля (в т.ч. silent).
   * Не зависит от показа ошибок в UI.
   */
  readonly isFieldValid: boolean;
  readonly isValid: boolean;
  readonly isRequired: boolean;
  readonly isDirty: boolean;
  readonly isPristine: boolean;
  readonly isChanged: boolean;
  /** Поле сейчас в процессе validate (`validationStatus.isValidating`). */
  readonly isValidating: boolean;
  readonly props: FormItemProps;
  readonly el: HTMLElement | null;
  validate: (silent?: boolean) => FormValidationResult;
  clearValidateErrors: VoidFunction;
  reset: VoidFunction;
  /** Сброс isDirty (после Form.reset). */
  resetMeta: VoidFunction;
}

export interface FormRootContext {
  props: FormProps<FormModel>;
  modelValue: ModelRef<FormModel>;
  /** Снимок model для reset и isChanged. */
  initialModel: DeepReadonly<ShallowRef<FormModel | undefined>>;
  registerFormItem: (formItem: FormItemInstance) => void;
  unregisterFormItem: (id: string) => void;
}

export interface FormItemExpose {
  isValid: ComputedRef<boolean>;
  isDirty: Ref<boolean>;
  isPristine: ComputedRef<boolean>;
  isChanged: ComputedRef<boolean>;
  isValidating: ComputedRef<boolean>;
  validate: (silent?: boolean) => FormValidationResult;
  clearValidateErrors: VoidFunction;
  reset: VoidFunction;
}
