import { Form } from '../index';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

describe('FormItem', () => {
  it('Проверка отрисовки', () => {
    const wrapper = mount(() => (
      <Form.Item
        v-slots={{
          header: () => 'Имя',
          default: () => <span class="form-item-content">Контент</span>
        }}
      />
    ));

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.get('.form-item').find('.form-item-content').text()).toBe('Контент');
    expect(wrapper.get('.form-item__header').text()).toContain('Имя');
  });
});
