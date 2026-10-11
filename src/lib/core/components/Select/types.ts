import type { SizeProp, ThemeProp, Maybe, MaybeArray } from '../../types';
import type { VNode, MaybeRefOrGetter } from 'vue';

export type OptionValue = string;
export type SelectModelValue = MaybeArray<OptionValue>;

export interface OptionProps {
  value: OptionValue;
  title?: string;
  disabled?: boolean;
}

export interface OptionScopedSlots {
  isActive: boolean;
  isDisabled: boolean;
}

export interface OptionSlots {
  default?: (props: OptionScopedSlots) => Array<VNode>;
}

export interface OptionInstance {
  id: string;
  props: OptionProps;
}

export type SelectProps = {
  disabled?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  loading?: boolean;
  placeholder?: string;
} & Partial<ThemeProp> & Partial<SizeProp>;

export interface SelectEmits {
  change: [payload: OptionValue];
  opened: [payload: Element];
  closed: [payload: Element];
  open: [];
  close: [];
  clear: [];
}

export interface SelectTriggerScopedSlot {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface SelectTriggerSlots {
  default: (props: SelectTriggerScopedSlot) => Array<VNode>;
}

export interface SelectRootContext {
  activeOption: MaybeRefOrGetter<Maybe<OptionInstance>>;
  activeOptions: MaybeRefOrGetter<Array<OptionInstance>>;
  isOpen: MaybeRefOrGetter<boolean>;
  hasValue: MaybeRefOrGetter<boolean>;
  props: MaybeRefOrGetter<SelectProps>;
  modelValue: MaybeRefOrGetter<SelectModelValue>;
  isDisabled: MaybeRefOrGetter<boolean>;
  setFocus: (payload: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setModelValue: (value: OptionValue) => void;
  registerOption: (option: OptionInstance) => void;
  unregisterOption: (id: string) => void;
}
