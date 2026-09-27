import { Form, useForm } from '../index';
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

  const form = useForm<Model>({
    model,
    rules: defineFormRules<Model>({
      name: z.string().nonempty(),
      email: z.email()
    })
  });

  const wrapper = mount(() => (
    <Form.Root form={form}>
      <Form.Item field={form.field('name')}>
        <input/>
      </Form.Item>
      <Form.Item field={form.field('email')}>
        <input/>
      </Form.Item>
    </Form.Root>
  ));

  return {
    wrapper,
    model,
    form,
    nameItem: form.field('name')
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

    expect(form.isPristine).toBe(true);
    expect(form.isDirty).toBe(false);
    expect(form.isChanged).toBe(false);
    expect(form.isValid).toBe(true);
    expect(form.canSubmit).toBe(false);
    expect(nameItem.isChanged).toBe(false);
    expect(nameItem.validationStatus.isError).toBe(false);
  });

  it('isDirty липкий, isChanged сравнивает с initial', async () => {
    const { form, model, nameItem } = mountForm();

    await settle();

    model.value.name = 'Пётр';
    await flush();

    expect(form.isDirty).toBe(true);
    expect(form.isPristine).toBe(false);
    expect(form.isChanged).toBe(true);
    expect(nameItem.isDirty).toBe(true);
    expect(nameItem.isChanged).toBe(true);

    model.value.name = 'Иван';
    await flush();

    expect(form.isChanged).toBe(false);
    expect(nameItem.isChanged).toBe(false);
    expect(form.isDirty).toBe(true);
  });

  it('canSubmit: только валидная и изменённая форма', async () => {
    const { form, model } = mountForm();

    await settle();

    expect(form.canSubmit).toBe(false);

    model.value.name = 'Пётр';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(form.isValid).toBe(true);
    expect(form.canSubmit).toBe(true);

    model.value.name = '';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(form.isValid).toBe(false);
    expect(form.canSubmit).toBe(false);
  });

  it('canSubmit: false у disabled-формы', async () => {
    const model = ref<Model>({ name: 'Иван', email: 'ivan@example.com' });
    const disabled = ref(false);

    const form = useForm<Model>({
      model,
      rules: defineFormRules<Model>({
        name: z.string().nonempty()
      }),
      disabled: () => disabled.value
    });

    mount(() => (
      <Form.Root form={form}>
        <Form.Item field={form.field('name')}>
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    model.value.name = 'Пётр';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(form.canSubmit).toBe(true);

    disabled.value = true;
    await flush();

    expect(form.isDisabled).toBe(true);
    expect(form.canSubmit).toBe(false);
  });

  it('isValidating: true на время validate()', async () => {
    const { form, nameItem } = mountForm();

    await settle();

    const promise = form.validate();

    expect(form.isValidating).toBe(true);
    expect(nameItem.validationStatus.isValidating).toBe(true);

    await promise;
    await flush();

    expect(form.isValidating).toBe(false);
    expect(nameItem.validationStatus.isValidating).toBe(false);
  });

  it('reset(): model к initial, meta сброшены, ошибок нет, форма валидна', async () => {
    const { form, model, nameItem } = mountForm();

    await settle();

    model.value.name = '';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(nameItem.validationStatus.isError).toBe(true);
    expect(form.isDirty).toBe(true);
    expect(form.isValid).toBe(false);

    form.reset();
    await settle();
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(model.value.name).toBe('Иван');
    expect(form.model.name).toBe('Иван');
    expect(form.isDirty).toBe(false);
    expect(form.isPristine).toBe(true);
    expect(form.isChanged).toBe(false);
    expect(form.isValid).toBe(true);
    expect(nameItem.validationStatus.isError).toBe(false);
    expect(nameItem.isDirty).toBe(false);
  });

  it('reset() отдаёт копию initial: мутация model не портит снимок', async () => {
    const { form, model } = mountForm();

    await settle();

    form.reset();
    await settle();

    model.value.name = 'Пётр';
    await flush();

    form.reset();
    await settle();

    expect(model.value.name).toBe('Иван');
  });

  it('commit(): текущая model становится initial, следующий reset() возвращает к ней', async () => {
    const { form, model } = mountForm();

    await settle();

    model.value.name = 'Пётр';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(form.isChanged).toBe(true);
    expect(form.canSubmit).toBe(true);

    form.commit();
    await settle();

    expect(model.value.name).toBe('Пётр');
    expect(form.isChanged).toBe(false);
    expect(form.isDirty).toBe(false);
    expect(form.canSubmit).toBe(false);
    expect(form.isValid).toBe(true);

    model.value.name = 'Сидор';
    await flush();

    form.reset();
    await settle();

    expect(model.value.name).toBe('Пётр');
    expect(form.isChanged).toBe(false);
  });

  it('clearValidate(): убирает UI-статус, isValid не падает', async () => {
    const { form, nameItem } = mountForm();

    await settle();

    await form.validate();
    await flush();

    expect(nameItem.validationStatus.isSuccess).toBe(true);
    expect(form.isValid).toBe(true);

    form.clearValidate();
    await settle();

    expect(nameItem.validationStatus.isSuccess).toBe(false);
    expect(nameItem.validationStatus.isError).toBe(false);
    expect(form.isValid).toBe(true);
    expect(nameItem.isFieldValid).toBe(true);
  });

  it('field.clearValidateErrors(): скрывает ошибку, логический результат актуален', async () => {
    const { form, model, nameItem } = mountForm();

    await settle();

    model.value.name = '';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(nameItem.validationStatus.isError).toBe(true);

    nameItem.clearValidateErrors();
    await settle();

    expect(nameItem.validationStatus.isError).toBe(false);
    expect(nameItem.isFieldValid).toBe(false);
    expect(form.isValid).toBe(false);
  });

  it('onValid/onInvalid: только при громкой валидации', async () => {
    const model = ref<Model>({ name: 'Иван', email: 'ivan@example.com' });
    const onFormValid = vi.fn();
    const onFormInvalid = vi.fn();
    const onItemValid = vi.fn();
    const onItemInvalid = vi.fn();

    const form = useForm<Model>({
      model,
      rules: defineFormRules<Model>({
        name: z.string().nonempty()
      }),
      onValid: onFormValid,
      onInvalid: onFormInvalid
    });

    mount(() => (
      <Form.Root form={form}>
        <Form.Item
          field={form.field('name')}
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
    form.clearValidate();
    await settle();
    form.reset();
    await settle();

    /* явный silent */
    await form.validate(true);
    await flush();

    expect(onFormValid).not.toHaveBeenCalled();
    expect(onFormInvalid).not.toHaveBeenCalled();
    expect(onItemValid).not.toHaveBeenCalled();
    expect(onItemInvalid).not.toHaveBeenCalled();

    await form.validate();
    await flush();

    expect(onFormValid).toHaveBeenCalledTimes(1);
    expect(onItemValid).toHaveBeenCalledTimes(1);
    expect(onFormInvalid).not.toHaveBeenCalled();

    model.value.name = '';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(onItemInvalid).toHaveBeenCalledTimes(1);

    await form.validate();
    await flush();

    expect(onFormInvalid).toHaveBeenCalledTimes(1);
    expect(onItemInvalid).toHaveBeenCalledTimes(2);
  });

  it('мутация массива на месте: isDirty, isChanged и валидация', async () => {
    interface TagsModel {
      tags: Array<string>;
    }

    const model = ref<TagsModel>({ tags: ['a'] });

    const form = useForm<TagsModel>({
      model,
      rules: defineFormRules<TagsModel>({
        tags: z.array(z.string()).max(1)
      })
    });

    const tags = form.field('tags');

    mount(() => (
      <Form.Root form={form}>
        <Form.Item field={tags}>
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    expect(form.isChanged).toBe(false);
    expect(form.isValid).toBe(true);

    model.value.tags.push('b');
    await flush();

    expect(tags.isDirty).toBe(true);
    expect(tags.isChanged).toBe(true);
    expect(form.isChanged).toBe(true);

    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(tags.validationStatus.isError).toBe(true);
    expect(form.isValid).toBe(false);

    model.value.tags.pop();
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(tags.isChanged).toBe(false);
    expect(tags.validationStatus.isError).toBe(false);
    expect(form.isValid).toBe(true);

    form.reset();
    await settle();

    expect(model.value.tags).toEqual(['a']);
    expect(tags.isDirty).toBe(false);
  });

  it('двойной submit: onSubmit только у последнего прогона и без ложного isValid: false', async () => {
    const onSubmit = vi.fn();

    const form = useForm<Model>({
      model: { name: 'Иван', email: 'ivan@example.com' },
      rules: defineFormRules<Model>({
        name: z.string().nonempty()
      }),
      onSubmit
    });

    const wrapper = mount(() => (
      <Form.Root form={form}>
        <Form.Item field={form.field('name')}>
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    const formEl = wrapper.get('form');

    void formEl.trigger('submit');
    void formEl.trigger('submit');
    await settle();

    expect(onSubmit).toHaveBeenCalledTimes(1);

    const payload = onSubmit.mock.calls[0]?.[0] as { isValid: boolean; };

    expect(payload.isValid).toBe(true);
  });

  it('параллельные validate(): каждый отдаёт честный результат', async () => {
    const { form } = mountForm();

    await settle();

    const [first, second] = await Promise.all([form.validate(), form.validate()]);

    expect(first).toBe(true);
    expect(second).toBe(true);
  });

  it('submit(): программный submit равен нативному — громкая валидация и onSubmit', async () => {
    const model = ref<Model>({ name: '', email: 'ivan@example.com' });
    const onSubmit = vi.fn();

    const form = useForm<Model>({
      model,
      rules: defineFormRules<Model>({
        name: z.string().nonempty()
      }),
      onSubmit
    });

    const name = form.field('name');

    mount(() => (
      <Form.Root form={form}>
        <Form.Item field={name}>
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    await form.submit();
    await flush();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(name.validationStatus.isError).toBe(true);

    const payload = onSubmit.mock.calls[0]?.[0] as { isValid: boolean; reset: unknown; commit: unknown; };

    expect(payload.isValid).toBe(false);
    expect(payload.reset).toBeTypeOf('function');
    expect(payload.commit).toBeTypeOf('function');

    model.value.name = 'Иван';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    await form.submit();
    await flush();

    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect((onSubmit.mock.calls[1]?.[0] as { isValid: boolean; }).isValid).toBe(true);
  });

  it('нативный submit: onSubmit получает isValid, reset и commit', async () => {
    const onSubmit = vi.fn();

    const form = useForm<Model>({
      model: { name: 'Иван', email: 'ivan@example.com' },
      onSubmit
    });

    const wrapper = mount(() => (
      <Form.Root form={form}>
        <Form.Item field={form.field('name')}>
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
