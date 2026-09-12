import type { ZodError, ZodType } from 'zod';
import type { ComputedRef, MaybeRefOrGetter, ModelRef, Ref, VNode } from 'vue';

export type FormModelValues = unknown;

export type FormModel = Record<string, FormModelValues>;

export type FormRules <MODEL> = {
  [K in keyof MODEL]: ZodType<MODEL[K], MODEL[K]>;
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

export interface FormSlots {
  default?: (props: {
    isValid: boolean;
  }) => Array<VNode>;
}

export type FormValidationResult = Promise<boolean>;

export interface FormInstance {
  validate: (silent?: boolean) => FormValidationResult;
  clearValidate: VoidFunction;
  reset: VoidFunction;
}

export type FormItemError = ZodError['issues'][number];

export interface FormItemProps {
  disabled?: boolean;
  name?: string;
}

export interface FormItemScopedSlot {
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
  reset?: VoidFunction;
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
  isValidatable: boolean;
  isRequired: boolean;
  props: FormItemProps;
  validate: (silent?: boolean) => FormValidationResult;
  validationStatus: FormItemValidationStatus;
  clearValidateErrors: VoidFunction;
  reset: VoidFunction;
}

export interface FormRootContext {
  props: FormProps<FormModel>;
  modelValue: ModelRef<FormModel>;
  registerFormItem: (formItem: FormItemInstance) => void;
  unregisterFormItem: (id: string) => void;
}

export type FormItemExpose = Pick<FormItemInstance, 'validate' | 'clearValidateErrors' | 'reset'>;

export type FormExpose = FormInstance;
