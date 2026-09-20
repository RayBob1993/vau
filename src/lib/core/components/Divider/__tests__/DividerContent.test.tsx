import { Divider } from '../index';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

describe('DividerContent', () => {
  it('Проверка отрисовки', () => {
    const wrapper = mount(() => (
      <Divider.Content>
        <span class="divider-content-slot">Контент</span>
      </Divider.Content>
    ));

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.get('div.divider-content').find('.divider-content-slot').text()).toBe('Контент');
  });
});
