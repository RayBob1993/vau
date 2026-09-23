import { Form, type FormInstance } from '../index';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';

describe('Form', () => {
  it('Проверка отрисовки', () => {
    const model = ref({
      name: ''
    });

    const wrapper = mount(() => (
      <Form.Root
        modelValue={model.value}
        onUpdate:modelValue={value => {
          model.value = value;
        }}
      >
        <span class="form-content">Контент</span>
      </Form.Root>
    ));

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.get('form.form').find('.form-content').text()).toBe('Контент');
  });

  it('Предоставляет API FormInstance через ref', () => {
    const model = ref({
      name: ''
    });
    const formRef = ref<FormInstance | null>(null);

    mount(() => (
      <Form.Root
        ref={formRef}
        modelValue={model.value}
        onUpdate:modelValue={value => {
          model.value = value;
        }}
      >
        <span>Контент</span>
      </Form.Root>
    ));

    expect(formRef.value).not.toBeNull();
    expect(formRef.value?.validate).toBeTypeOf('function');
    expect(formRef.value?.clearValidate).toBeTypeOf('function');
    expect(formRef.value?.reset).toBeTypeOf('function');
    expect(formRef.value?.isValid).toBeTypeOf('boolean');
    expect(formRef.value?.isDirty).toBeTypeOf('boolean');
    expect(formRef.value?.isPristine).toBeTypeOf('boolean');
    expect(formRef.value?.isChanged).toBeTypeOf('boolean');
    expect(formRef.value?.isValidating).toBeTypeOf('boolean');
    expect(formRef.value?.canSubmit).toBeTypeOf('boolean');
  });
});
