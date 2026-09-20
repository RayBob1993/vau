import { Drawer, type DrawerPosition } from '../index';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';

function mountDrawer (options?: {
  position?: DrawerPosition;
}) {
  const open = ref(true);

  return mount(() => (
    <Drawer.Root
      modelValue={open.value}
      appendToBody={false}
      position={options?.position}
      onUpdate:modelValue={value => {
        open.value = value;
      }}
    >
      <Drawer.Dialog>
        <Drawer.Content>
          <span class="drawer-slot">Контент</span>
        </Drawer.Content>
      </Drawer.Dialog>
    </Drawer.Root>
  ));
}

describe('Drawer', () => {
  it('Проверка отрисовки', () => {
    const wrapper = mountDrawer();

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.get('div.drawer').classes()).toContain('drawer--open');
    expect(wrapper.get('div.drawer-dialog div.drawer-content').find('.drawer-slot').text()).toBe('Контент');
  });

  it('по умолчанию position=left', () => {
    const wrapper = mountDrawer();

    expect(wrapper.get('div.drawer').classes()).toContain('drawer--position-left');
  });

  it.each([
    'left',
    'right',
    'top',
    'bottom'
  ] as const)('добавляет класс position-%s', (position) => {
    const wrapper = mountDrawer({
      position
    });

    expect(wrapper.get('div.drawer').classes()).toContain(`drawer--position-${position}`);
  });
});
