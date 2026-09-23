import type { SizeProp, ThemeProp } from '../../types';
import type { MaybeRefOrGetter } from 'vue';

export type SwitchModelValue = boolean;

export type SwitchProps = {
  disabled?: boolean;
} & Partial<ThemeProp> & Partial<SizeProp>;

export interface SwitchRootContext {
  props: MaybeRefOrGetter<SwitchProps>;
  isActive: MaybeRefOrGetter<SwitchModelValue>;
  isDisabled: MaybeRefOrGetter<boolean>;
  isSuccess: MaybeRefOrGetter<boolean>;
  isError: MaybeRefOrGetter<boolean>;
}
