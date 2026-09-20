import { Modal, type ModalPosition } from '../index';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';

function mountModal (options?: {
  position?: ModalPosition;
}) {
  const open = ref(true);

  return mount(() => (
    <Modal.Root
      modelValue={open.value}
      appendToBody={false}
      position={options?.position}
      onUpdate:modelValue={value => {
        open.value = value;
      }}
    >
      <Modal.Dialog>
        <Modal.Content>
          <span class="modal-slot">Контент</span>
        </Modal.Content>
      </Modal.Dialog>
    </Modal.Root>
  ));
}

describe('Modal', () => {
  it('Проверка отрисовки', () => {
    const wrapper = mountModal();

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.get('div.modal').classes()).toContain('modal--open');
    expect(wrapper.get('div.modal-dialog div.modal-content').find('.modal-slot').text()).toBe('Контент');
  });

  it('по умолчанию position=center', () => {
    const wrapper = mountModal();

    expect(wrapper.get('div.modal').classes()).toContain('modal--position-center');
  });

  it.each([
    'top',
    'center',
    'bottom'
  ] as const)('добавляет класс position-%s', position => {
    const wrapper = mountModal({
      position
    });

    expect(wrapper.get('div.modal').classes()).toContain(`modal--position-${position}`);
  });
});
