import { Form, type FormItemExpose } from '../index';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';

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

  it('Предоставляет методы FormItemExpose', () => {
    const itemRef = ref<FormItemExpose | null>(null);

    mount(() => (
      <Form.Item ref={itemRef}>
        <span>Контент</span>
      </Form.Item>
    ));

    expect(itemRef.value).not.toBeNull();
    expect(itemRef.value?.validate).toBeTypeOf('function');
    expect(itemRef.value?.clearValidateErrors).toBeTypeOf('function');
    expect(itemRef.value?.reset).toBeTypeOf('function');
  });
});
