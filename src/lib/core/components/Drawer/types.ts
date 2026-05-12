import type { SizeProp } from '../../types';
import type { MaybeRefOrGetter, VNode } from 'vue';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export type DrawerProps = {
  position?: DrawerPosition;
  appendToBody?: boolean;
  closeOnEscape?: boolean;
} & Partial<Pick<SizeProp, 'size'>>;

export interface DrawerEmits {
  opened: [payload: Element];
  closed: [payload: Element];
  open: [];
  close: [];
}

export interface DrawerScopedSlot {
  close: VoidFunction;
}

export interface DrawerSlots {
  default?: (props: DrawerScopedSlot) => Array<VNode>;
}

export interface DrawerRootContext {
  props: MaybeRefOrGetter<DrawerProps>;
  close: VoidFunction;
}
