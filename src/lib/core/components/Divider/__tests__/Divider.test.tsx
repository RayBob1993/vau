import { Divider } from '../index';
import { Direction } from '../../../constants/direction';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

describe('Divider', () => {
  it('Проверка отрисовки', () => {
    const wrapper = mount(() => (
      <Divider.Root>
        <span class="divider-slot">Контент</span>
      </Divider.Root>
    ));

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.get('div.divider').find('.divider-slot').text()).toBe('Контент');
  });

  it('добавляет класс направления', () => {
    const wrapper = mount(() => (
      <Divider.Root direction={Direction.VERTICAL}/>
    ));

    expect(wrapper.get('div.divider').classes()).toContain(`divider--direction-${Direction.VERTICAL}`);
  });

  it('вкладывает Divider.Content', () => {
    const wrapper = mount(() => (
      <Divider.Root>
        <Divider.Content>Текст</Divider.Content>
      </Divider.Root>
    ));

    expect(wrapper.get('div.divider div.divider-content').text()).toBe('Текст');
  });
});
