import { Form, type FormInstance, type FormItemInstance } from '../index';
import { defineFormRules } from '../../../utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { z } from 'zod';

interface Model {
  name: string;
  email: string;
}

const DEBOUNCE = 300;

/** Пропустить микрозадачи (safeParseAsync, takeLatest) и один тик Vue. */
async function flush () {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }

  await nextTick();
}

/** Mount + готовность реестра + silent parse. */
async function settle () {
  await flush();
  await flush();
}

function mountForm (initial: Model = { name: 'Иван', email: 'ivan@example.com' }) {
  const model = ref<Model>({ ...initial });
  const formRef = ref<FormInstance | null>(null);
  const nameRef = ref<FormItemInstance | null>(null);

  const rules = defineFormRules<Model>({
    name: z.string().nonempty(),
    email: z.email()
  });

  const wrapper = mount(() => (
    <Form.Root
      ref={formRef}
      modelValue={model.value}
      rules={rules}
      onUpdate:modelValue={value => {
        model.value = value;
      }}
    >
      <Form.Item
        ref={nameRef}
        name="name"
      >
        <input/>
      </Form.Item>
      <Form.Item name="email">
        <input/>
      </Form.Item>
    </Form.Root>
  ));

  return {
    wrapper,
    model,
    form: () => formRef.value!,
    nameItem: () => nameRef.value!
  };
}

describe('Form meta', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('после mount: pristine, не changed, валидна', async () => {
    const { form, nameItem } = mountForm();

    await settle();

    expect(form().isPristine).toBe(true);
    expect(form().isDirty).toBe(false);
    expect(form().isChanged).toBe(false);
    expect(form().isValid).toBe(true);
    expect(form().canSubmit).toBe(false);
    expect(nameItem().isChanged).toBe(false);
    expect(nameItem().validationStatus.isError).toBe(false);
  });

  it('isDirty липкий, isChanged сравнивает с initial', async () => {
    const { form, model, nameItem } = mountForm();

    await settle();

    model.value.name = 'Пётр';
    await flush();

    expect(form().isDirty).toBe(true);
    expect(form().isPristine).toBe(false);
    expect(form().isChanged).toBe(true);
    expect(nameItem().isDirty).toBe(true);
    expect(nameItem().isChanged).toBe(true);

    model.value.name = 'Иван';
    await flush();

    expect(form().isChanged).toBe(false);
    expect(nameItem().isChanged).toBe(false);
    expect(form().isDirty).toBe(true);
  });

  it('canSubmit: только валидная и изменённая форма', async () => {
    const { form, model } = mountForm();

    await settle();

    expect(form().canSubmit).toBe(false);

    model.value.name = 'Пётр';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(form().isValid).toBe(true);
    expect(form().canSubmit).toBe(true);

    model.value.name = '';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(form().isValid).toBe(false);
    expect(form().canSubmit).toBe(false);
  });

  it('canSubmit: false у disabled-формы', async () => {
    const model = ref<Model>({ name: 'Иван', email: 'ivan@example.com' });
    const disabled = ref(false);
    const formRef = ref<FormInstance | null>(null);

    const rules = defineFormRules<Model>({
      name: z.string().nonempty()
    });

    mount(() => (
      <Form.Root
        ref={formRef}
        modelValue={model.value}
        rules={rules}
        disabled={disabled.value}
        onUpdate:modelValue={value => {
          model.value = value;
        }}
      >
        <Form.Item name="name">
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    model.value.name = 'Пётр';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(formRef.value!.canSubmit).toBe(true);

    disabled.value = true;
    await flush();

    expect(formRef.value!.canSubmit).toBe(false);
  });

  it('isValidating: true на время validate()', async () => {
    const { form, nameItem } = mountForm();

    await settle();

    const promise = form().validate();

    expect(form().isValidating).toBe(true);
    expect(nameItem().validationStatus.isValidating).toBe(true);

    await promise;
    await flush();

    expect(form().isValidating).toBe(false);
    expect(nameItem().validationStatus.isValidating).toBe(false);
  });

  it('reset(): model к initial, meta сброшены, ошибок нет, форма валидна', async () => {
    const { form, model, nameItem } = mountForm();

    await settle();

    model.value.name = '';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(nameItem().validationStatus.isError).toBe(true);
    expect(form().isDirty).toBe(true);
    expect(form().isValid).toBe(false);

    form().reset();
    await settle();
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(model.value.name).toBe('Иван');
    expect(form().isDirty).toBe(false);
    expect(form().isPristine).toBe(true);
    expect(form().isChanged).toBe(false);
    expect(form().isValid).toBe(true);
    expect(nameItem().validationStatus.isError).toBe(false);
    expect(nameItem().isDirty).toBe(false);
  });

  it('reset() отдаёт копию initial: мутация model не портит снимок', async () => {
    const { form, model } = mountForm();

    await settle();

    form().reset();
    await settle();

    model.value.name = 'Пётр';
    await flush();

    form().reset();
    await settle();

    expect(model.value.name).toBe('Иван');
  });

  it('commit(): текущая model становится initial, следующий reset() возвращает к ней', async () => {
    const { form, model } = mountForm();

    await settle();

    model.value.name = 'Пётр';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(form().isChanged).toBe(true);
    expect(form().canSubmit).toBe(true);

    form().commit();
    await settle();

    expect(model.value.name).toBe('Пётр');
    expect(form().isChanged).toBe(false);
    expect(form().isDirty).toBe(false);
    expect(form().canSubmit).toBe(false);
    expect(form().isValid).toBe(true);

    model.value.name = 'Сидор';
    await flush();

    form().reset();
    await settle();

    expect(model.value.name).toBe('Пётр');
    expect(form().isChanged).toBe(false);
  });

  it('clearValidate(): убирает UI-статус, isValid не падает', async () => {
    const { form, nameItem } = mountForm();

    await settle();

    await form().validate();
    await flush();

    expect(nameItem().validationStatus.isSuccess).toBe(true);
    expect(form().isValid).toBe(true);

    form().clearValidate();
    await settle();

    expect(nameItem().validationStatus.isSuccess).toBe(false);
    expect(nameItem().validationStatus.isError).toBe(false);
    expect(form().isValid).toBe(true);
    expect(nameItem().isFieldValid).toBe(true);
  });

  it('FormItem.clearValidateErrors(): скрывает ошибку, логический результат актуален', async () => {
    const { form, model, nameItem } = mountForm();

    await settle();

    model.value.name = '';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(nameItem().validationStatus.isError).toBe(true);

    nameItem().clearValidateErrors();
    await settle();

    expect(nameItem().validationStatus.isError).toBe(false);
    expect(nameItem().isFieldValid).toBe(false);
    expect(form().isValid).toBe(false);
  });

  it('valid/invalid: только при громкой валидации', async () => {
    const model = ref<Model>({ name: 'Иван', email: 'ivan@example.com' });
    const formRef = ref<FormInstance | null>(null);
    const onFormValid = vi.fn();
    const onFormInvalid = vi.fn();
    const onItemValid = vi.fn();
    const onItemInvalid = vi.fn();

    const rules = defineFormRules<Model>({
      name: z.string().nonempty()
    });

    mount(() => (
      <Form.Root
        ref={formRef}
        modelValue={model.value}
        rules={rules}
        onUpdate:modelValue={value => {
          model.value = value;
        }}
        onValid={onFormValid}
        onInvalid={onFormInvalid}
      >
        <Form.Item
          name="name"
          onValid={onItemValid}
          onInvalid={onItemInvalid}
        >
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    /* mount: silent parse */
    await settle();

    /* clearValidate и reset: silent пересчёт */
    formRef.value!.clearValidate();
    await settle();
    formRef.value!.reset();
    await settle();

    /* явный silent */
    await formRef.value!.validate(true);
    await flush();

    expect(onFormValid).not.toHaveBeenCalled();
    expect(onFormInvalid).not.toHaveBeenCalled();
    expect(onItemValid).not.toHaveBeenCalled();
    expect(onItemInvalid).not.toHaveBeenCalled();

    await formRef.value!.validate();
    await flush();

    expect(onFormValid).toHaveBeenCalledTimes(1);
    expect(onItemValid).toHaveBeenCalledTimes(1);
    expect(onFormInvalid).not.toHaveBeenCalled();

    model.value.name = '';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(onItemInvalid).toHaveBeenCalledTimes(1);

    await formRef.value!.validate();
    await flush();

    expect(onFormInvalid).toHaveBeenCalledTimes(1);
    expect(onItemInvalid).toHaveBeenCalledTimes(2);
  });

  it('мутация массива на месте: isDirty, isChanged и валидация', async () => {
    interface TagsModel {
      tags: Array<string>;
    }

    const model = ref<TagsModel>({ tags: ['a'] });
    const formRef = ref<FormInstance | null>(null);
    const tagsRef = ref<FormItemInstance | null>(null);

    const rules = defineFormRules<TagsModel>({
      tags: z.array(z.string()).max(1)
    });

    mount(() => (
      <Form.Root
        ref={formRef}
        modelValue={model.value}
        rules={rules}
        onUpdate:modelValue={value => {
          model.value = value;
        }}
      >
        <Form.Item
          ref={tagsRef}
          name="tags"
        >
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    expect(formRef.value!.isChanged).toBe(false);
    expect(formRef.value!.isValid).toBe(true);

    model.value.tags.push('b');
    await flush();

    expect(tagsRef.value!.isDirty).toBe(true);
    expect(tagsRef.value!.isChanged).toBe(true);
    expect(formRef.value!.isChanged).toBe(true);

    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(tagsRef.value!.validationStatus.isError).toBe(true);
    expect(formRef.value!.isValid).toBe(false);

    model.value.tags.pop();
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(tagsRef.value!.isChanged).toBe(false);
    expect(tagsRef.value!.validationStatus.isError).toBe(false);
    expect(formRef.value!.isValid).toBe(true);

    formRef.value!.reset();
    await settle();

    expect(model.value.tags).toEqual(['a']);
    expect(tagsRef.value!.isDirty).toBe(false);
  });

  it('двойной submit: событие только у последнего прогона и без ложного isValid: false', async () => {
    const model = ref<Model>({ name: 'Иван', email: 'ivan@example.com' });
    const onSubmit = vi.fn();

    const rules = defineFormRules<Model>({
      name: z.string().nonempty()
    });

    const wrapper = mount(() => (
      <Form.Root
        modelValue={model.value}
        rules={rules}
        onUpdate:modelValue={value => {
          model.value = value;
        }}
        onSubmit={onSubmit}
      >
        <Form.Item name="name">
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    const form = wrapper.get('form');

    void form.trigger('submit');
    void form.trigger('submit');
    await settle();

    expect(onSubmit).toHaveBeenCalledTimes(1);

    const payload = onSubmit.mock.calls[0]?.[0] as { isValid: boolean; };

    expect(payload.isValid).toBe(true);
  });

  it('параллельные validate(): каждый отдаёт честный результат', async () => {
    const { form } = mountForm();

    await settle();

    const [first, second] = await Promise.all([form().validate(), form().validate()]);

    expect(first).toBe(true);
    expect(second).toBe(true);
  });

  it('submit(): программный submit равен нативному — громкая валидация и событие', async () => {
    const model = ref<Model>({ name: '', email: 'ivan@example.com' });
    const formRef = ref<FormInstance | null>(null);
    const nameRef = ref<FormItemInstance | null>(null);
    const onSubmit = vi.fn();

    const rules = defineFormRules<Model>({
      name: z.string().nonempty()
    });

    mount(() => (
      <Form.Root
        ref={formRef}
        modelValue={model.value}
        rules={rules}
        onUpdate:modelValue={value => {
          model.value = value;
        }}
        onSubmit={onSubmit}
      >
        <Form.Item
          ref={nameRef}
          name="name"
        >
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    await formRef.value!.submit();
    await flush();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(nameRef.value!.validationStatus.isError).toBe(true);

    const payload = onSubmit.mock.calls[0]?.[0] as { isValid: boolean; reset: unknown; commit: unknown; };

    expect(payload.isValid).toBe(false);
    expect(payload.reset).toBeTypeOf('function');
    expect(payload.commit).toBeTypeOf('function');

    model.value.name = 'Иван';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    await formRef.value!.submit();
    await flush();

    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect((onSubmit.mock.calls[1]?.[0] as { isValid: boolean; }).isValid).toBe(true);
  });

  it('submit: событие получает isValid, reset и commit', async () => {
    const model = ref<Model>({ name: 'Иван', email: 'ivan@example.com' });
    const onSubmit = vi.fn();

    const wrapper = mount(() => (
      <Form.Root
        modelValue={model.value}
        onUpdate:modelValue={value => {
          model.value = value;
        }}
        onSubmit={onSubmit}
      >
        <Form.Item name="name">
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    await wrapper.get('form').trigger('submit');
    await settle();

    expect(onSubmit).toHaveBeenCalledTimes(1);

    const payload = onSubmit.mock.calls[0]?.[0] as { isValid: boolean; reset: unknown; commit: unknown; };

    expect(payload.isValid).toBe(true);
    expect(payload.reset).toBeTypeOf('function');
    expect(payload.commit).toBeTypeOf('function');
  });
});
