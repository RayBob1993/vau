import type { SizeProp } from '../../types';
import type { MaybeRefOrGetter } from 'vue';

export type ModalPosition = 'top' | 'center' | 'bottom';

export type ModalProps = {
  position?: ModalPosition;
  appendToBody?: boolean;
  closeOnEscape?: boolean;
} & Partial<Pick<SizeProp, 'size'>>;

export interface ModalEmits {
  opened: [payload: Element];
  closed: [payload: Element];
  open: [];
  close: [];
}

export interface ModalRootContext {
  props: MaybeRefOrGetter<ModalProps>;
  close: VoidFunction;
}
