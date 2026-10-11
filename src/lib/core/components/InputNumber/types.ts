import type { InputBaseProps } from '../Input';
import type { DirectionProp, SizeProp, ThemeProp, } from '../../types';
import type { MaybeRefOrGetter } from 'vue';

export type InputNumberModelValue = number;

export type InputNumberMousewheel = boolean | number;

export interface InputNumberBaseProps extends InputBaseProps {
  min?: number;
  max?: number;
  step?: number;
}

export type InputNumberProps = {
  mousewheel?: InputNumberMousewheel;
} & InputNumberBaseProps & Partial<DirectionProp> & Partial<ThemeProp> & Partial<SizeProp>;

export type InputNumberButtonAction = 'decrement' | 'increment';

export interface InputNumberButtonProps {
  action: InputNumberButtonAction;
}

export interface InputNumberRootContext {
  props: MaybeRefOrGetter<InputNumberProps>;
  step: MaybeRefOrGetter<number>;
  modelValue: MaybeRefOrGetter<InputNumberModelValue>;
  isDisabled: MaybeRefOrGetter<boolean>;
  isDecrementDisabled: MaybeRefOrGetter<boolean>;
  isIncrementDisabled: MaybeRefOrGetter<boolean>;
  handleDecrement: VoidFunction;
  handleIncrement: VoidFunction;
  setModelValue: (value: InputNumberModelValue) => void;
  setFocus: (payload: boolean) => void;
}
