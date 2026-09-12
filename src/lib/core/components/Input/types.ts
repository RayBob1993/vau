import type { SizeProp, ThemeProp, Maybe, ValueOf } from '../../types';
import type { EmitFn, MaybeRefOrGetter, VNode } from 'vue';
import { InputModes, InputNativeTypes, InputTypes } from '../../constants';

export type InputModelValue = Maybe<string>;

export type InputType = ValueOf<typeof InputTypes>;
export type InputNativeType = ValueOf<typeof InputNativeTypes>;
export type InputMode = ValueOf<typeof InputModes>;

export interface InputBaseProps {
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  autocomplete?: string;
}

export interface InputNativeProps extends InputBaseProps {
  nativeType?: InputNativeType;
  inputMode?: InputMode;
}

export interface InputTextareaProps extends InputBaseProps {
  rows?: HTMLTextAreaElement['rows'];
  cols?: HTMLTextAreaElement['cols'];
}

export type InputProps = {
  type?: InputType;
  clearable?: boolean;
  loading?: boolean;
} & InputBaseProps & Partial<InputNativeProps> & Partial<InputTextareaProps> & Partial<ThemeProp> & Partial<SizeProp>;

export interface InputScopedSlot {
  isTextarea: boolean;
  isFocus: boolean;
  hasValue: boolean;
  loading: boolean;
  isValid: boolean;
  isInvalid: boolean;
}

export interface InputSlots {
  default?: (props: InputScopedSlot) => Array<VNode>;
  before?: (props: InputScopedSlot) => Array<VNode>;
  after?: (props: InputScopedSlot) => Array<VNode>;
}

export interface InputEmits {
  click: [event: PointerEvent];
  dblclick: [event: MouseEvent];
  mousedown: [event: MouseEvent];
  mouseup: [event: MouseEvent];
  mouseenter: [event: MouseEvent];
  mouseleave: [event: MouseEvent];
  mousemove: [event: MouseEvent];
  mouseover: [event: MouseEvent];
  mouseout: [event: MouseEvent];
  contextmenu: [event: Event];
  focusin: [event: Event];
  focusout: [event: Event];
  change: [event: Event];
  blur: [event: Event];
  focus: [event: Event];
  keyup: [event: KeyboardEvent];
  keydown: [event: KeyboardEvent];
  keypress: [event: KeyboardEvent];
  paste: [event: ClipboardEvent];
  copy: [event: ClipboardEvent];
  cut: [event: ClipboardEvent];
}

export interface InputRootContext {
  props: MaybeRefOrGetter<InputProps>;
  modelValue: MaybeRefOrGetter<InputModelValue>;
  isDisabled: MaybeRefOrGetter<boolean>;
  setFocus: (payload: boolean) => void;
  setModelValue: (value: InputModelValue) => void;
  clear: VoidFunction;
  emit: EmitFn<InputEmits>;
}

export interface InputExpose {
  setFocus: (payload: boolean) => void;
}

export type InputInstance = InputExpose;
