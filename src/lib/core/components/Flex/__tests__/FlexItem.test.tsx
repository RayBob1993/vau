import { Flex } from '../index';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

describe('FlexItem', () => {
  it('Проверка отрисовки', () => {
    const wrapper = mount(() => (
      <Flex.Item>
        <span class="flex-item-content">Контент</span>
      </Flex.Item>
    ));

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.get('div.flex-item').find('.flex-item-content').text()).toBe('Контент');
  });

  it.each([
    'auto',
    'content',
    'grow',
    'shrink'
  ] as const)('добавляет класс flex-%s', flex => {
    const wrapper = mount(() => (
      <Flex.Item flex={flex}/>
    ));

    expect(wrapper.get('div.flex-item').classes()).toContain(`flex-item--flex-${flex}`);
  });
});
