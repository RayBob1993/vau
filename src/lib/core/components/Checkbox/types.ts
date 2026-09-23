import type { MaybeRefOrGetter, VNode } from 'vue';
import type { Maybe, DirectionProp, SizeProp, ThemeProp } from '../../types';

export type CheckboxValue = number | string;
export type CheckboxModelValue = boolean | Array<CheckboxValue>;

export type CheckboxProps = {
  disabled?: boolean;
  indeterminate?: boolean;
  value?: CheckboxValue;
  checked?: boolean;
} & Partial<ThemeProp> & Partial<SizeProp>;

export interface CheckboxEmits {
  change: [payload: CheckboxValue];
}

export interface CheckboxRootContext {
  props: MaybeRefOrGetter<CheckboxProps>;
  modelValue: MaybeRefOrGetter<Maybe<CheckboxModelValue>>;
  isActive: MaybeRefOrGetter<boolean>;
  isDisabled: MaybeRefOrGetter<boolean>;
  isIndeterminate: MaybeRefOrGetter<boolean>;
  isSuccess: MaybeRefOrGetter<boolean>;
  isError: MaybeRefOrGetter<boolean>;
}

export interface CheckboxIndicatorScopedSlot {
  isDisabled: boolean;
  isActive: boolean;
  isIndeterminate: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface CheckboxIndicatorSlots {
  default?: (props: CheckboxIndicatorScopedSlot) => Array<VNode>;
}

export type CheckboxGroupProps = Partial<DirectionProp>;
