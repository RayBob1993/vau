import type { FormItemScopedSlot, FormRules } from '../types';
import {
  Form,
  FORM_RULE_EXCEPTION_MESSAGE,
  FORM_SCROLL_INTO_VIEW_OPTIONS,
  type FormInstance,
  type FormItemInstance
} from '../index';
import { useFormItemContext } from '../context';
import { defineFormRules } from '../../../utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref } from 'vue';
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

interface MountOptions {
  initial?: Model;
  rules?: FormRules<Model>;
}

function mountForm ({
  initial = { name: 'Иван', email: 'ivan@example.com' },
  rules = defineFormRules<Model>({
    name: z.string().nonempty(),
    email: z.email()
  })
}: MountOptions = {}) {
  const model = ref<Model>({ ...initial });
  const formRef = ref<FormInstance | null>(null);
  const nameRef = ref<FormItemInstance | null>(null);

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

describe('Form validation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('debounce: серия правок — один parse через 300 мс, до этого ошибок нет', async () => {
    const parse = vi.fn((value: string) => value.length > 0);

    const { model, nameItem } = mountForm({
      rules: defineFormRules<Model>({
        name: z.string().refine(parse)
      })
    });

    await settle();
    parse.mockClear();

    model.value.name = 'П';
    await flush();
    model.value.name = 'Пё';
    await flush();
    model.value.name = '';
    await flush();

    await vi.advanceTimersByTimeAsync(DEBOUNCE - 1);
    await flush();

    expect(parse).not.toHaveBeenCalled();
    expect(nameItem().validationStatus.isError).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await flush();

    expect(parse).toHaveBeenCalledTimes(1);
    expect(parse).toHaveBeenCalledWith('');
    expect(nameItem().validationStatus.isError).toBe(true);
  });

  it('takeLatest: устаревший результат parse не перекрывает актуальный', async () => {
    const gates: Array<VoidFunction> = [];

    const { model, form, nameItem } = mountForm({
      rules: defineFormRules<Model>({
        name: z.string().refine(async value => {
          await new Promise<void>(resolve => {
            gates.push(resolve);
          });

          return value.length > 0;
        })
      })
    });

    /* mount: silent parse ждёт свой gate */
    await settle();

    expect(gates).toHaveLength(1);

    gates.splice(0).forEach(open => {
      open();
    });
    await settle();

    expect(form().isValid).toBe(true);

    /* Первый (медленный) прогон — невалидное значение */
    model.value.name = '';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    /* Второй прогон — валидное значение */
    model.value.name = 'Пётр';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(gates).toHaveLength(2);
    expect(nameItem().validationStatus.isValidating).toBe(true);

    /* Второй завершился раньше */
    gates[1]!();
    await settle();

    expect(nameItem().validationStatus.isSuccess).toBe(true);
    expect(nameItem().validationStatus.isError).toBe(false);
    expect(nameItem().validationStatus.isValidating).toBe(false);

    /* Первый догнал — UI и isFieldValid не трогает */
    gates[0]!();
    await settle();

    expect(nameItem().validationStatus.isSuccess).toBe(true);
    expect(nameItem().validationStatus.isError).toBe(false);
    expect(nameItem().isFieldValid).toBe(true);
    expect(form().isValid).toBe(true);
  });

  it('v-if: скрытый FormItem не участвует в валидации, хотя поле есть в model и в rules', async () => {
    /* name: '' — невалидно по rules, но поле скрыто */
    const model = ref<Model>({ name: '', email: 'ivan@example.com' });
    const showName = ref(false);
    const formRef = ref<FormInstance | null>(null);
    const nameRef = ref<FormItemInstance | null>(null);
    const onSubmit = vi.fn();
    const onInvalid = vi.fn();

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
        onSubmit={onSubmit}
        onInvalid={onInvalid}
      >
        {showName.value && (
          <Form.Item
            ref={nameRef}
            name="name"
          >
            <input/>
          </Form.Item>
        )}
        <Form.Item name="email">
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    /* Скрыто с mount: агрегаты, validate() и submit игнорируют поле */
    expect(formRef.value!.isValid).toBe(true);
    expect(wrapper.get('form').classes()).not.toContain('form--invalid');
    expect(await formRef.value!.validate()).toBe(true);
    expect(onInvalid).not.toHaveBeenCalled();

    await wrapper.get('form').trigger('submit');
    await settle();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect((onSubmit.mock.calls[0]?.[0] as { isValid: boolean; }).isValid).toBe(true);

    /* Правка скрытого поля в model не делает форму dirty / changed */
    model.value.name = 'x';
    await flush();
    model.value.name = '';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(formRef.value!.isDirty).toBe(false);
    expect(formRef.value!.isChanged).toBe(false);
    expect(formRef.value!.isValid).toBe(true);

    /* Показали — поле регистрируется и роняет валидность */
    showName.value = true;
    await settle();

    expect(formRef.value!.isValid).toBe(false);
    /* Логически невалидна, но ошибка ещё не показана — класса нет */
    expect(wrapper.get('form').classes()).not.toContain('form--invalid');
    expect(await formRef.value!.validate()).toBe(false);
    await flush();
    expect(onInvalid).toHaveBeenCalledTimes(1);
    expect(nameRef.value!.validationStatus.isError).toBe(true);
    expect(wrapper.get('form').classes()).toContain('form--invalid');

    /* Скрыли с показанной ошибкой — форма снова валидна, класс снят, submit проходит */
    showName.value = false;
    await settle();

    expect(formRef.value!.isValid).toBe(true);
    expect(wrapper.get('form').classes()).not.toContain('form--invalid');
    expect(formRef.value!.isValidating).toBe(false);
    expect(await formRef.value!.validate()).toBe(true);

    await wrapper.get('form').trigger('submit');
    await settle();

    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect((onSubmit.mock.calls[1]?.[0] as { isValid: boolean; }).isValid).toBe(true);

    /* Показали повторно — ошибка не «висит» с прошлого раза, но логика невалидна */
    showName.value = true;
    await settle();

    expect(nameRef.value!.validationStatus.isError).toBe(false);
    expect(nameRef.value!.isValid).toBe(false);
    expect(formRef.value!.isValid).toBe(false);
  });

  it('FormItem без rule: не валидируется, isValid true, isRequired false, isDirty работает', async () => {
    const { model, form, nameItem } = mountForm({
      rules: defineFormRules<Model>({
        email: z.email()
      })
    });

    await settle();

    expect(nameItem().isValidatable).toBe(false);
    expect(nameItem().isValid).toBe(true);
    expect(nameItem().isRequired).toBe(false);
    expect(form().isValid).toBe(true);

    model.value.name = '';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(nameItem().isDirty).toBe(true);
    expect(nameItem().validationStatus.isError).toBe(false);
    expect(form().isValid).toBe(true);

    /* validate() согласован с isValid: невалидируемое поле — true, UI не трогается */
    expect(await nameItem().validate()).toBe(true);
    expect(nameItem().validationStatus.isSuccess).toBe(false);
    expect(nameItem().isValid).toBe(true);
    expect(await form().validate()).toBe(true);
  });

  it('disabled FormItem: исключён из валидации и не блокирует форму', async () => {
    const model = ref<Model>({ name: '', email: 'ivan@example.com' });
    const disabled = ref(true);
    const formRef = ref<FormInstance | null>(null);
    const nameRef = ref<FormItemInstance | null>(null);

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
      >
        <Form.Item
          ref={nameRef}
          name="name"
          disabled={disabled.value}
        >
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    expect(nameRef.value!.isValidatable).toBe(false);
    expect(nameRef.value!.isRequired).toBe(false);
    expect(nameRef.value!.isValid).toBe(true);
    expect(formRef.value!.isValid).toBe(true);
    expect(await nameRef.value!.validate()).toBe(true);
    expect(await formRef.value!.validate()).toBe(true);
    expect(nameRef.value!.validationStatus.isError).toBe(false);

    disabled.value = false;
    await settle();

    expect(nameRef.value!.isValidatable).toBe(true);
    expect(nameRef.value!.isRequired).toBe(true);
    expect(formRef.value!.isValid).toBe(false);

    disabled.value = true;
    await settle();

    expect(formRef.value!.isValid).toBe(true);
  });

  it('несколько контролов в FormItem: поле disabled, только когда disabled все; отписка не сбрасывает остальных', async () => {
    /* Минимальный контрол: регистрируется в FormItem и сообщает свой disabled. */
    const Control = defineComponent({
      props: {
        disabled: Boolean
      },
      setup (props) {
        const formItemContext = useFormItemContext();
        let unregisterField: VoidFunction | undefined;

        onMounted(() => {
          unregisterField = formItemContext?.registerField({
            isDisabled: () => props.disabled
          });
        });

        onUnmounted(() => {
          unregisterField?.();
        });

        return () => <input/>;
      }
    });

    const model = ref<Model>({ name: '', email: 'ivan@example.com' });
    const firstDisabled = ref(true);
    const secondDisabled = ref(false);
    const showSecond = ref(true);
    const formRef = ref<FormInstance | null>(null);
    const nameRef = ref<FormItemInstance | null>(null);

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
      >
        <Form.Item
          ref={nameRef}
          name="name"
        >
          <Control disabled={firstDisabled.value}/>
          {showSecond.value && <Control disabled={secondDisabled.value}/>}
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    /* Одна выключенная опция из двух — поле валидируется */
    expect(nameRef.value!.isValidatable).toBe(true);
    expect(formRef.value!.isValid).toBe(false);

    /* Выключены все — поле вне валидации */
    secondDisabled.value = true;
    await settle();

    expect(nameRef.value!.isValidatable).toBe(false);
    expect(formRef.value!.isValid).toBe(true);

    /* Второй включили обратно */
    secondDisabled.value = false;
    await settle();

    expect(nameRef.value!.isValidatable).toBe(true);

    /* Второй (включённый) размонтирован — остался только выключенный первый */
    showSecond.value = false;
    await settle();

    expect(nameRef.value!.isValidatable).toBe(false);

    /* Первый включили — регистрация не потерялась при отписке второго */
    firstDisabled.value = false;
    await settle();

    expect(nameRef.value!.isValidatable).toBe(true);
    expect(formRef.value!.isValid).toBe(false);
  });

  it('isRequired: из Zod-схемы — обязательно, если undefined не проходит', async () => {
    interface OptionalModel {
      name: string;
      email?: string;
    }

    const model = ref<OptionalModel>({ name: '' });
    const nameRef = ref<FormItemInstance | null>(null);
    const emailRef = ref<FormItemInstance | null>(null);

    const rules = defineFormRules<OptionalModel>({
      name: z.string().nonempty(),
      email: z.string().optional()
    });

    const wrapper = mount(() => (
      <Form.Root
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
        <Form.Item
          ref={emailRef}
          name="email"
        >
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    expect(nameRef.value!.isRequired).toBe(true);
    expect(emailRef.value!.isRequired).toBe(false);

    const [nameEl, emailEl] = wrapper.findAll('.form-item');

    expect(nameEl!.classes()).toContain('form-item--required');
    expect(emailEl!.classes()).not.toContain('form-item--required');
  });

  it('isRequired: async-refine не ломает вычисление — обязательность по обёртке схемы', async () => {
    interface AsyncModel {
      name: string;
      nick?: string;
      city?: string;
    }

    const model = ref<AsyncModel>({ name: '' });
    const nameRef = ref<FormItemInstance | null>(null);
    const nickRef = ref<FormItemInstance | null>(null);
    const cityRef = ref<FormItemInstance | null>(null);

    const isFree = (value: string | undefined) => Promise.resolve(value !== 'taken');

    const rules = defineFormRules<AsyncModel>({
      name: z.string().refine(isFree),
      nick: z.string().optional().refine(isFree),
      city: z.string().default('Москва').refine(isFree)
    });

    const wrapper = mount(() => (
      <Form.Root
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
        <Form.Item
          ref={nickRef}
          name="nick"
        >
          <input/>
        </Form.Item>
        <Form.Item
          ref={cityRef}
          name="city"
        >
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    expect(wrapper.findAll('.form-item')).toHaveLength(3);
    expect(nameRef.value!.isRequired).toBe(true);
    expect(nickRef.value!.isRequired).toBe(false);
    expect(cityRef.value!.isRequired).toBe(false);
  });

  it('смена rules: isFieldValid пересчитан, показанная ошибка обновлена', async () => {
    const model = ref<Model>({ name: 'Иван', email: 'ivan@example.com' });
    const rules = ref<FormRules<Model>>(defineFormRules<Model>({
      name: z.string().min(10)
    }));
    const formRef = ref<FormInstance | null>(null);
    const nameRef = ref<FormItemInstance | null>(null);

    mount(() => (
      <Form.Root
        ref={formRef}
        modelValue={model.value}
        rules={rules.value}
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
      </Form.Root>
    ));

    await settle();

    expect(formRef.value!.isValid).toBe(false);

    await formRef.value!.validate();
    await flush();

    expect(nameRef.value!.validationStatus.isError).toBe(true);

    rules.value = defineFormRules<Model>({
      name: z.string().nonempty()
    });
    await settle();

    expect(nameRef.value!.validationStatus.isError).toBe(false);
    expect(nameRef.value!.validationStatus.isSuccess).toBe(true);
    expect(formRef.value!.isValid).toBe(true);
  });

  it('динамические rules: computed + defineFormRules переключает правило поля по реактивному значению', async () => {
    interface ContactModel {
      contact: string;
    }

    const byPhone = ref(false);
    const model = ref<ContactModel>({ contact: 'ivan@example.com' });
    const formRef = ref<FormInstance | null>(null);
    const contactRef = ref<FormItemInstance | null>(null);

    const rules = computed(() => defineFormRules<ContactModel>({
      contact: byPhone.value
        ? z.string().regex(/^\+7\d{10}$/, 'Введите телефон')
        : z.email('Введите e-mail')
    }));

    const wrapper = mount(() => (
      <Form.Root
        ref={formRef}
        modelValue={model.value}
        rules={rules.value}
        onUpdate:modelValue={value => {
          model.value = value;
        }}
      >
        <Form.Item
          ref={contactRef}
          name="contact"
          v-slots={{
            default: ({ errors }: FormItemScopedSlot) => (
              <span class="errors">{errors.map(error => error.message).join(', ')}</span>
            )
          }}
        />
      </Form.Root>
    ));

    await settle();

    /* e-mail под правилом e-mail — валидно */
    expect(formRef.value!.isValid).toBe(true);

    /* Переключили на телефон: тот же ввод невалиден, silent — без ошибки в UI */
    byPhone.value = true;
    await settle();

    expect(formRef.value!.isValid).toBe(false);
    expect(contactRef.value!.validationStatus.isError).toBe(false);

    /* Громкая валидация — сообщение от актуального правила */
    await formRef.value!.validate();
    await flush();

    expect(contactRef.value!.validationStatus.isError).toBe(true);
    expect(wrapper.get('.errors').text()).toBe('Введите телефон');

    /* Ввели телефон — валидно под текущим правилом */
    model.value.contact = '+79991234567';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(formRef.value!.isValid).toBe(true);
    expect(contactRef.value!.validationStatus.isSuccess).toBe(true);

    /* Вернули e-mail-правило при показанном статусе: UI обновлён громко без ввода */
    byPhone.value = false;
    await settle();

    expect(formRef.value!.isValid).toBe(false);
    expect(contactRef.value!.validationStatus.isError).toBe(true);
    expect(contactRef.value!.validationStatus.isSuccess).toBe(false);
    expect(wrapper.get('.errors').text()).toBe('Введите e-mail');
  });

  it('динамические rules: правило зависит от другого поля model и может исчезать', async () => {
    interface PromoModel {
      hasPromo: boolean;
      promo: string;
    }

    const model = ref<PromoModel>({ hasPromo: false, promo: '' });
    const formRef = ref<FormInstance | null>(null);
    const promoRef = ref<FormItemInstance | null>(null);

    /* Правило для promo существует только при hasPromo */
    const rules = computed(() => defineFormRules<PromoModel>({
      promo: model.value.hasPromo ? z.string().nonempty('Введите промокод') : undefined
    }));

    mount(() => (
      <Form.Root
        ref={formRef}
        modelValue={model.value}
        rules={rules.value}
        onUpdate:modelValue={value => {
          model.value = value;
        }}
      >
        <Form.Item name="hasPromo">
          <input/>
        </Form.Item>
        <Form.Item
          ref={promoRef}
          name="promo"
        >
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    /* Без правила: поле не валидируется, не обязательное, форма валидна */
    expect(promoRef.value!.isValidatable).toBe(false);
    expect(promoRef.value!.isRequired).toBe(false);
    expect(formRef.value!.isValid).toBe(true);

    /* Включили промокод: пустое поле стало обязательным и роняет форму */
    model.value.hasPromo = true;
    await settle();

    expect(promoRef.value!.isValidatable).toBe(true);
    expect(promoRef.value!.isRequired).toBe(true);
    expect(formRef.value!.isValid).toBe(false);

    await formRef.value!.validate();
    await flush();

    expect(promoRef.value!.validationStatus.isError).toBe(true);

    /* Выключили: правило пропало — ошибка снята, форма валидна */
    model.value.hasPromo = false;
    await settle();

    expect(promoRef.value!.isValidatable).toBe(false);
    expect(promoRef.value!.validationStatus.isError).toBe(false);
    expect(formRef.value!.isValid).toBe(true);
    expect(await formRef.value!.validate()).toBe(true);
  });

  it('исключение в правиле: форма не залипает, поле невалидно с ошибкой, submit приходит', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    interface LoginModel {
      login: string;
    }

    const model = ref<LoginModel>({ login: 'boom' });
    const formRef = ref<FormInstance | null>(null);
    const loginRef = ref<FormItemInstance | null>(null);
    const onSubmit = vi.fn();

    /* Имитация упавшего запроса на проверку уникальности */
    const rules = defineFormRules<LoginModel>({
      login: z.string().refine(value => {
        if (value === 'boom') {
          return Promise.reject(new Error('network'));
        }

        return Promise.resolve(true);
      })
    });

    const wrapper = mount(() => (
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
          ref={loginRef}
          name="login"
          v-slots={{
            default: ({ errors }: FormItemScopedSlot) => (
              <span class="errors">{errors.map(error => error.message).join(', ')}</span>
            )
          }}
        />
      </Form.Root>
    ));

    /* mount: silent parse упал — статусы не зависли, логически невалидно, UI чист */
    await settle();

    expect(loginRef.value!.validationStatus.isValidating).toBe(false);
    expect(formRef.value!.isValidating).toBe(false);
    expect(formRef.value!.isValid).toBe(false);
    expect(loginRef.value!.validationStatus.isError).toBe(false);
    expect(consoleError).toHaveBeenCalledTimes(1);

    /* Громкая: validate() резолвится false, ошибка показана в формате issue */
    await expect(formRef.value!.validate()).resolves.toBe(false);
    await flush();

    expect(loginRef.value!.validationStatus.isError).toBe(true);
    expect(wrapper.get('.errors').text()).toBe(FORM_RULE_EXCEPTION_MESSAGE);

    /* submit не теряется */
    await wrapper.get('form').trigger('submit');
    await settle();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect((onSubmit.mock.calls[0]?.[0] as { isValid: boolean; }).isValid).toBe(false);

    /* Правило перестало падать — поле восстанавливается обычным путём */
    model.value.login = 'ivan';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await settle();

    expect(loginRef.value!.validationStatus.isError).toBe(false);
    expect(loginRef.value!.validationStatus.isSuccess).toBe(true);
    expect(formRef.value!.isValid).toBe(true);
    expect(wrapper.get('.errors').text()).toBe('');
  });

  it('form--invalid: только при показанной ошибке поля, не при логической невалидности', async () => {
    const { wrapper, form, model, nameItem } = mountForm({
      initial: { name: '', email: 'ivan@example.com' }
    });

    await settle();

    /* mount: логически невалидна, но ни поле, ни форма не подсвечены */
    expect(form().isValid).toBe(false);
    expect(wrapper.get('form').classes()).not.toContain('form--invalid');
    expect(wrapper.get('.form-item').classes()).not.toContain('form-item--invalid');

    /* silent validate — тоже без подсветки */
    await form().validate(true);
    await flush();

    expect(wrapper.get('form').classes()).not.toContain('form--invalid');

    /* громкая — подсвечены и поле, и форма */
    await form().validate();
    await flush();

    expect(nameItem().validationStatus.isError).toBe(true);
    expect(wrapper.get('.form-item').classes()).toContain('form-item--invalid');
    expect(wrapper.get('form').classes()).toContain('form--invalid');

    /* исправили ввод — ошибка ушла, класс формы снят */
    model.value.name = 'Иван';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(wrapper.get('form').classes()).not.toContain('form--invalid');

    /* снова сломали, затем clearValidate — UI чист, хотя isValid false */
    model.value.name = '';
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await flush();

    expect(wrapper.get('form').classes()).toContain('form--invalid');

    form().clearValidate();
    await settle();

    expect(form().isValid).toBe(false);
    expect(wrapper.get('form').classes()).not.toContain('form--invalid');
  });

  it('submit невалидной формы: isValid false, ошибки в scoped slot, событие invalid', async () => {
    const model = ref<Model>({ name: '', email: 'ivan@example.com' });
    const onSubmit = vi.fn();
    const onInvalid = vi.fn();

    const rules = defineFormRules<Model>({
      name: z.string().nonempty('Введите имя')
    });

    const wrapper = mount(() => (
      <Form.Root
        modelValue={model.value}
        rules={rules}
        onUpdate:modelValue={value => {
          model.value = value;
        }}
        onSubmit={onSubmit}
        onInvalid={onInvalid}
      >
        <Form.Item
          name="name"
          v-slots={{
            default: ({ errors }: FormItemScopedSlot) => (
              <span class="errors">{errors.map(error => error.message).join(', ')}</span>
            )
          }}
        />
      </Form.Root>
    ));

    await settle();

    expect(wrapper.get('.errors').text()).toBe('');

    await wrapper.get('form').trigger('submit');
    await settle();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onInvalid).toHaveBeenCalledTimes(1);

    const payload = onSubmit.mock.calls[0]?.[0] as { isValid: boolean; };

    expect(payload.isValid).toBe(false);
    expect(wrapper.get('.errors').text()).toBe('Введите имя');
    expect(wrapper.get('.form-item').classes()).toContain('form-item--invalid');
  });

  it('scrollToError: скролл к первому невалидному FormItem только после громкой валидации', async () => {
    const model = ref<Model>({ name: 'Иван', email: 'не email' });
    const formRef = ref<FormInstance | null>(null);

    const rules = defineFormRules<Model>({
      name: z.string().nonempty(),
      email: z.email()
    });

    const wrapper = mount(() => (
      <Form.Root
        ref={formRef}
        modelValue={model.value}
        rules={rules}
        scrollToError
        onUpdate:modelValue={value => {
          model.value = value;
        }}
      >
        <Form.Item name="name">
          <input/>
        </Form.Item>
        <Form.Item name="email">
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    const [nameEl, emailEl] = wrapper.findAll('.form-item').map(item => item.element);
    const scrollName = vi.fn();
    const scrollEmail = vi.fn();

    nameEl!.scrollIntoView = scrollName;
    emailEl!.scrollIntoView = scrollEmail;

    await formRef.value!.validate(true);
    await flush();

    expect(scrollName).not.toHaveBeenCalled();
    expect(scrollEmail).not.toHaveBeenCalled();

    await formRef.value!.validate();
    await flush();

    expect(scrollName).not.toHaveBeenCalled();
    expect(scrollEmail).toHaveBeenCalledTimes(1);
    expect(scrollEmail).toHaveBeenCalledWith(FORM_SCROLL_INTO_VIEW_OPTIONS);
  });

  it('scrollToError: первый невалидный — по положению в DOM, а не по порядку регистрации', async () => {
    const model = ref<Model>({ name: '', email: 'не email' });
    const showName = ref(true);
    const formRef = ref<FormInstance | null>(null);

    const rules = defineFormRules<Model>({
      name: z.string().nonempty(),
      email: z.email()
    });

    const wrapper = mount(() => (
      <Form.Root
        ref={formRef}
        modelValue={model.value}
        rules={rules}
        scrollToError
        onUpdate:modelValue={value => {
          model.value = value;
        }}
      >
        {showName.value && (
          <Form.Item name="name">
            <input/>
          </Form.Item>
        )}
        <Form.Item name="email">
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    /* Перемонтируем name: в реестре он теперь последний, в DOM — первый */
    showName.value = false;
    await settle();
    showName.value = true;
    await settle();

    const [nameEl, emailEl] = wrapper.findAll('.form-item').map(item => item.element);
    const scrollName = vi.fn();
    const scrollEmail = vi.fn();

    nameEl!.scrollIntoView = scrollName;
    emailEl!.scrollIntoView = scrollEmail;

    await formRef.value!.validate();
    await flush();

    expect(scrollName).toHaveBeenCalledTimes(1);
    expect(scrollEmail).not.toHaveBeenCalled();
  });

  it('scrollToError с объектом: дополняет дефолты', async () => {
    const model = ref<Model>({ name: '', email: 'ivan@example.com' });
    const formRef = ref<FormInstance | null>(null);

    const rules = defineFormRules<Model>({
      name: z.string().nonempty()
    });

    const wrapper = mount(() => (
      <Form.Root
        ref={formRef}
        modelValue={model.value}
        rules={rules}
        scrollToError={{ block: 'start' }}
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

    const scroll = vi.fn();

    wrapper.get('.form-item').element.scrollIntoView = scroll;

    await formRef.value!.validate();
    await flush();

    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('scrollToError выключен по умолчанию', async () => {
    const { wrapper, form } = mountForm({
      initial: { name: '', email: 'ivan@example.com' }
    });

    await settle();

    const scroll = vi.fn();

    wrapper.get('.form-item').element.scrollIntoView = scroll;

    await form().validate();
    await flush();

    expect(scroll).not.toHaveBeenCalled();
  });

  it('дубликат name: предупреждение в консоль', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const model = ref<Model>({ name: 'Иван', email: 'ivan@example.com' });

    mount(() => (
      <Form.Root
        modelValue={model.value}
        onUpdate:modelValue={value => {
          model.value = value;
        }}
      >
        <Form.Item name="name">
          <input/>
        </Form.Item>
        <Form.Item name="name">
          <input/>
        </Form.Item>
      </Form.Root>
    ));

    await settle();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('name="name"');
  });
});
