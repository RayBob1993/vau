import { Form, useForm } from '../index';
import { defineFormRules } from '../../../utils';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { z } from 'zod';

async function flush () {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }

  await nextTick();
}

describe('Form', () => {
  it('Проверка отрисовки', () => {
    const form = useForm({
      model: {
        name: ''
      }
    });

    const wrapper = mount(() => (
      <Form.Root form={form}>
        <span class="form-content">Контент</span>
      </Form.Root>
    ));

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.get('form.form').find('.form-content').text()).toBe('Контент');
    /* Валидация своя — нативная не должна перехватывать submit */
    expect(wrapper.get('form').attributes('novalidate')).toBeDefined();
  });

  it('Контроллер useForm предоставляет API формы', () => {
    const form = useForm({
      model: {
        name: ''
      }
    });

    mount(() => (
      <Form.Root form={form}>
        <span>Контент</span>
      </Form.Root>
    ));

    expect(form.validate).toBeTypeOf('function');
    expect(form.submit).toBeTypeOf('function');
    expect(form.validateModel).toBeTypeOf('function');
    expect(form.clearValidate).toBeTypeOf('function');
    expect(form.reset).toBeTypeOf('function');
    expect(form.commit).toBeTypeOf('function');
    expect(form.field).toBeTypeOf('function');
    expect(form.isValid).toBeTypeOf('boolean');
    expect(form.isDirty).toBeTypeOf('boolean');
    expect(form.isPristine).toBeTypeOf('boolean');
    expect(form.isChanged).toBeTypeOf('boolean');
    expect(form.isValidating).toBeTypeOf('boolean');
    expect(form.canSubmit).toBeTypeOf('boolean');
    expect(form.isBound).toBeTypeOf('boolean');
  });

  it('ядро работает без Form.Root: isValid / canSubmit по model и rules', async () => {
    const form = useForm({
      model: {
        name: ''
      },
      rules: defineFormRules({
        name: z.string().nonempty()
      })
    });

    await flush();

    expect(form.isBound).toBe(false);
    expect(form.isValid).toBe(false);
    expect(form.canSubmit).toBe(false);
    expect(form.field('name').isRequired).toBe(true);

    form.model.name = 'Иван';
    await flush();

    expect(form.isValid).toBe(true);
    expect(form.isChanged).toBe(true);
    expect(form.isDirty).toBe(true);
    expect(form.canSubmit).toBe(true);

    form.reset();
    await flush();

    expect(form.model.name).toBe('');
    expect(form.isChanged).toBe(false);
    expect(form.isDirty).toBe(false);
    expect(form.canSubmit).toBe(false);
  });
});
