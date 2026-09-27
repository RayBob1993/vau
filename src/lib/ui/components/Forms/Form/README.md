# VForm

Форма с валидацией на **Zod**. Состояние, model, rules и действия живут в контроллере `useForm()`. `VForm` / `Form.Root` рендерит нативный `<form>` и провайдит контроллер полям.

## Базовое использование

```vue
<script lang="ts" setup>
  import {
    VForm,
    VFormItem,
    VInput,
    VCheckbox,
    VButton,
    defineFormRules,
    useForm
  } from 'vau';
  import { z } from 'zod';

  interface FormModel {
    name: string;
    email: string;
    policy: boolean;
  }

  const form = useForm<FormModel>({
    model: {
      name: '',
      email: '',
      policy: false
    },
    rules: defineFormRules<FormModel>({
      name: z.string().nonempty({
        error: 'Поле обязательно для заполнения'
      }),
      email: z.email({
        error: 'Неверный формат email'
      }),
      policy: z.literal(true, {
        error: 'Необходимо согласие'
      })
    }),
    scrollToError: true,
    onSubmit: ({ isValid, reset }) => {
      if (isValid) {
        console.log('Валидация прошла успешно');
        reset();
      } else {
        console.log('Валидация не прошла');
      }
    }
  });
</script>

<template>
  <v-form :form="form">
    <v-form-item
      title="Имя"
      :field="form.field('name')"
    >
      <v-input v-model="form.model.name"/>
    </v-form-item>

    <v-form-item
      title="Email"
      :field="form.field('email')"
    >
      <v-input
        v-model="form.model.email"
        native-type="email"
      />
    </v-form-item>

    <v-form-item :field="form.field('policy')">
      <v-checkbox v-model="form.model.policy">
        Согласие на обработку данных
      </v-checkbox>
    </v-form-item>

    <v-button
      type="submit"
      :disabled="!form.canSubmit"
    >
      Отправить
    </v-button>
  </v-form>
</template>
```

Кнопка может лежать **вне** `<v-form>` — тот же `form.submit()` / `form.canSubmit`, без `ref` на форму.

```vue
<v-form :form="form">
  <!-- поля -->
</v-form>

<v-button
  :disabled="!form.canSubmit"
  @click="form.submit()"
>
  Создать
</v-button>
```

## Динамические поля

`form.isValid` смотрит на **всю** model и `rules`, UI не обязателен. `v-if` на `VFormItem` скрывает поле и его ошибки, но значение в model по-прежнему проверяется. Чтобы поле не участвовало в схеме — уберите ключ из `rules` (`computed`).

```vue
<script lang="ts" setup>
  import {
    VForm,
    VFormItem,
    VInput,
    VCheckbox,
    VButton,
    defineFormRules,
    useForm
  } from 'vau';
  import { ref } from 'vue';
  import { z } from 'zod';

  interface FormModel {
    name: string;
    company: string;
  }

  const isLegalEntity = ref(false);

  const form = useForm<FormModel>({
    model: {
      name: '',
      company: ''
    },
    rules: defineFormRules<FormModel>({
      name: z.string().nonempty({
        error: 'Поле обязательно для заполнения'
      }),
      company: z.string().nonempty({
        error: 'Укажите название компании'
      })
    }),
    onSubmit: ({ isValid }) => {
      if (isValid) {
        console.log('Валидация прошла успешно');
      }
    }
  });
</script>

<template>
  <v-form :form="form">
    <v-form-item
      title="Имя"
      :field="form.field('name')"
    >
      <v-input v-model="form.model.name"/>
    </v-form-item>

    <v-checkbox v-model="isLegalEntity">
      Юридическое лицо
    </v-checkbox>

    <v-form-item
      v-if="isLegalEntity"
      title="Компания"
      :field="form.field('company')"
    >
      <v-input v-model="form.model.company"/>
    </v-form-item>

    <v-button
      type="submit"
      :disabled="!form.canSubmit"
    >
      Отправить
    </v-button>
  </v-form>
</template>
```

Пока `isLegalEntity === false`, `company` в model всё равно проверяется правилом. Чтобы шаг не блокировал submit — не кладите правило, пока чекбокс выключен (`computed` + `defineFormRules`). `form.field('company').isMounted` говорит только о наличии item в DOM.

## Правила: `defineFormRules` и `computed`

`defineFormRules` оборачивает словарь Zod в `markRaw`: схемы не становятся глубоко реактивными (Proxy ломает Zod и даёт лишний трекинг). Реактивность нужна у model, а не у самих схем.

### Статический объект

Подходит, когда набор и ограничения полей **не меняются** после создания формы:

```ts
const rules = defineFormRules<FormModel>({
  name: z.string().nonempty({ error: 'Обязательно' }),
  email: z.email({ error: 'Неверный email' })
});

const form = useForm<FormModel>({
  model: { name: '', email: '' },
  rules
});
```

### `computed` + `defineFormRules`

Нужен, когда схема зависит от внешнего состояния (длина, режим, связанные поля и т.п.):

```ts
const minNameLength = ref(3);

const form = useForm<FormModel>({
  model: { name: '', email: '' },
  rules: computed(() =>
    defineFormRules<FormModel>({
      name: z.string().min(minNameLength.value, {
        error: `Минимум ${minNameLength.value} символа`
      }),
      email: z.email({ error: 'Неверный email' })
    })
  )
});
```

При смене зависимостей `computed` возвращает **новый** объект rules → FormItem видит новую Zod-схему и пересчитывает статус:

- статус ещё не показан — тихая проверка (`isValid` / кнопка submit обновляются без красных сообщений);
- поле уже показывает вердикт (ошибка или успех) — обычная валидация: текст ошибок подтягивается под новые ограничения, «зелёное» поле при новом правиле может стать красным без ввода.

Правило может и исчезать: если для ключа вернуть `undefined`, поле перестаёт валидироваться (`isRequired` → `false`, ошибки снимаются), при возврате правила — снова участвует.

Без `computed` смена «логики» правил (мутация старого объекта или замена схемы «вручную» без реактивной обёртки) **не** обновит `isFieldValid` и UI: Form следит за сменой ссылки на rule у поля, а не за внутренностями Zod.

| Способ                                     | Когда                                           | Реакция на смену ограничений        |
|--------------------------------------------|-------------------------------------------------|-------------------------------------|
| `defineFormRules({ ... })`                 | Фиксированные правила                           | Нет — схема одна на весь срок жизни |
| `computed(() => defineFormRules({ ... }))` | Правила зависят от `ref` / props / других полей | Да — silent или с ошибками в UI     |

### Исключение в правиле

Если правило бросило исключение (`throw` в `refine`, отклонённый промис в async-`refine` — например, упал запрос на проверку уникальности), поле считается **невалидным** с одной ошибкой `FORM_RULE_EXCEPTION_MESSAGE` («Не удалось проверить значение»), исходная ошибка уходит в `console.error`. Статусы не зависают: `isValidating` снимается, `validate()` резолвится `false`, `onSubmit` приходит с `isValid: false`. Чтобы показать своё сообщение, ловите ошибку внутри `refine`:

```ts
login: z.string().superRefine(async (value, ctx) => {
  try {
    if (!(await api.isLoginFree(value))) {
      ctx.addIssue({ code: 'custom', message: 'Логин занят' });
    }
  } catch {
    ctx.addIssue({ code: 'custom', message: 'Сервер недоступен, попробуйте позже' });
  }
})
```

## Как устроено

- `useForm()` — единственный источник model, rules, meta и действий.
- Каждый `VFormItem` с `:field="form.field('email')"` валидирует **своё** поле: ключ верхнего уровня в `form.model` и в `rules`. `field()` типизирован — опечатка в имени не компилируется.
- `form.isValid` / `form.canSubmit` считает **ядро** по всей model и `rules`, даже без `VForm` / `VFormItem`. Компоненты — только ввод и показ ошибок.
- Скрытый через `v-if` item не показывает ошибку в UI, но пустое обязательное поле в model по-прежнему роняет `isValid`.
- Поле disabled, если disabled форма (`useForm({ disabled })`), сам `VFormItem` или **все** контролы внутри него: одна выключенная опция группы Radio/Checkbox не снимает валидацию с поля, полностью выключенная группа — снимает.
- `rules` можно задавать частично — не для всех ключей model.
- Значение поля отслеживается глубоко: `form.model.tags.push(...)` или правка вложенного свойства объекта ставят `isDirty` и запускают валидацию так же, как переприсваивание.
- `field.name` должен быть **уникален** среди смонтированных item одной формы (в DEV при дубле — `console.warn`).
- `VFormItem` с `title` показывает заголовок и признак обязательности.

## Meta: dirty / pristine / changed

Для смонтированных `FormItem` с `field`:

| Флаг           | Поле                                                     | Форма (`form.*`)                                                |
|----------------|----------------------------------------------------------|-----------------------------------------------------------------|
| `isDirty`      | Значение менялось хотя бы раз (липкий до `reset` формы)  | Хотя бы одно поле dirty                                         |
| `isPristine`   | Значение никогда не меняли (`!isDirty`)                  | Все поля pristine                                               |
| `isChanged`    | Текущее значение ≠ снимок `initial`                      | Хотя бы одно поле changed                                       |
| `isValid`      | Логический результат parse (для невалидируемых — `true`) | Вся model по `rules`, без привязки к DOM                        |
| `isValidating` | `validationStatus.isValidating`                          | Хотя бы одно поле в процессе validate                           |
| `canSubmit`    | —                                                        | `!isDisabled && isValid && isChanged && !isValidating`          |

Снимок `initial` берётся один раз — когда `VForm` смонтировался. Два метода работают с ним:

- `form.reset()` — вернуть model к `initial`, сбросить `isDirty` и UI-статусы валидации. Форма **создания**: после отправки получить чистую форму;
- `form.commit()` — принять **текущую** model как новый `initial`: значения остаются, `isChanged` → `false`, `isDirty` сброшен, UI-статусы очищены. Форма **редактирования**: после сохранения не откатывать введённое. Также после асинхронной загрузки данных в model.

`reset()` рассчитан на синхронное обновление model: значения из снимка не считаются вводом пользователя, пока форма не получила их обратно в том же тике.

Класс `form--invalid` — UI-статус, как и `form-item--invalid`: ставится, когда хотя бы одно поле **показывает** ошибку после громкой валидации. Логическая невалидность форму не подсвечивает — для кнопки используйте `form.isValid` / `form.canSubmit`.

### Пример: сохранить / сбросить / индикатор изменений

```vue
<script lang="ts" setup>
  import {
    VForm,
    VFormItem,
    VInput,
    VButton,
    defineFormRules,
    useForm
  } from 'vau';
  import { z } from 'zod';

  interface FormModel {
    name: string;
    email: string;
  }

  const form = useForm<FormModel>({
    model: {
      name: 'Иван',
      email: 'ivan@example.com'
    },
    rules: defineFormRules<FormModel>({
      name: z.string().nonempty({
        error: 'Укажите имя'
      }),
      email: z.email({
        error: 'Неверный email'
      })
    }),
    onSubmit: ({ isValid, commit }) => {
      if (!isValid) {
        return;
      }

      commit();
    }
  });
</script>

<template>
  <v-form :form="form">
    <v-form-item
      title="Имя"
      :field="form.field('name')"
    >
      <v-input v-model="form.model.name"/>
      <span
        v-if="form.field('name').isChanged"
        class="hint"
      >
        изменено
      </span>
    </v-form-item>

    <v-form-item
      title="Email"
      :field="form.field('email')"
    >
      <v-input
        v-model="form.model.email"
        native-type="email"
      />
    </v-form-item>

    <p v-if="form.isChanged">
      Есть несохранённые изменения
    </p>

    <v-button
      type="submit"
      :disabled="!form.canSubmit"
      :loading="form.isValidating"
    >
      Сохранить
    </v-button>

    <v-button
      type="button"
      :disabled="!form.isDirty"
      @click="form.reset()"
    >
      Сбросить
    </v-button>
  </v-form>
</template>
```

### Пример: валидация одного поля

`form.field('email')` — типизированная ссылка на поле: проверить одно поле перед запросом, сбросить ошибки, прочитать meta.

```vue
<script lang="ts" setup>
  import {
    VForm,
    VFormItem,
    VInput,
    VButton,
    defineFormRules,
    useForm
  } from 'vau';
  import { ref } from 'vue';
  import { z } from 'zod';

  interface FormModel {
    email: string;
    code: string;
  }

  const isCodeStep = ref(false);
  const isCheckingEmail = ref(false);

  const form = useForm<FormModel>({
    model: {
      email: '',
      code: ''
    },
    rules: defineFormRules<FormModel>({
      email: z.email({
        error: 'Неверный email'
      }),
      code: z.string().length(6, {
        error: 'Код из 6 символов'
      })
    }),
    onSubmit: ({ isValid }) => {
      if (isValid) {
        console.log('вход', form.model);
      }
    }
  });

  const email = form.field('email');

  async function goToCodeStep () {
    const emailOk = await email.validate();

    if (!emailOk) {
      return;
    }

    isCheckingEmail.value = true;

    try {
      isCodeStep.value = true;
    } finally {
      isCheckingEmail.value = false;
    }
  }
</script>

<template>
  <v-form :form="form">
    <v-form-item
      title="Email"
      :field="email"
    >
      <v-input
        v-model="form.model.email"
        native-type="email"
        :disabled="isCodeStep"
      />
    </v-form-item>

    <v-form-item
      v-if="isCodeStep"
      title="Код"
      :field="form.field('code')"
    >
      <v-input v-model="form.model.code"/>
    </v-form-item>

    <v-button
      v-if="!isCodeStep"
      type="button"
      :loading="isCheckingEmail"
      @click="goToCodeStep"
    >
      Получить код
    </v-button>

    <v-button
      v-else
      type="submit"
    >
      Войти
    </v-button>
  </v-form>
</template>
```

## API

### `useForm(options)`

Возвращает реактивный `FormController`. Объект не проксируется Vue: геттеры читают внутренние ref.

#### Опции

| Имя             | Описание                                                                                                                                                       | Тип                                          | Обязательно |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------|-------------|
| `model`         | Модель. `Ref` — общий с вызывающим; объект — начальное значение, контроллер оборачивает в `ref`                                                                | `Ref<MODEL>` / `MODEL`                       | `true`      |
| `rules`         | Правила Zod по ключам model (`defineFormRules`); для динамических — `computed` / getter                                                                        | `MaybeRefOrGetter<FormRules<MODEL>>`         | `false`     |
| `disabled`      | Блокировка формы и полей внутри                                                                                                                                | `MaybeRefOrGetter<boolean>`                  | `false`     |
| `scrollToError` | После неуспешного `validate` / submit — скролл к первому ошибочному FormItem. `true` — `{ behavior: 'smooth', block: 'center' }`; объект дополняет эти дефолты | `MaybeRefOrGetter<boolean \| ScrollIntoViewOptions>` | `false` |
| `onSubmit`      | После громкой валидации (нативный submit или `form.submit()`)                                                                                                  | `(payload: FormSubmitEvent) => void`         | `false`     |
| `onValid`       | Форма прошла громкую валидацию; silent-прогоны не вызывают                                                                                                     | `VoidFunction`                               | `false`     |
| `onInvalid`     | Форма не прошла громкую валидацию; silent-прогоны не вызывают                                                                                                  | `VoidFunction`                               | `false`     |

#### Контроллер

| Имя              | Описание                                                                                                                                                                                | Тип |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----|
| `model`          | Текущая model (get/set)                                                                                                                                                                 | `MODEL` |
| `rules`          | Актуальные правила                                                                                                                                                                      | `FormRules<MODEL>` |
| `isBound`        | Смонтирован `VForm` (скролл, классы хоста). На `isValid` / `canSubmit` не влияет                                                                                                        | `boolean` |
| `isDisabled`     | Форма disabled                                                                                                                                                                          | `boolean` |
| `isValid`        | Вся model прошла `rules`                                                                                                                                                                | `boolean` |
| `hasErrors`      | Хотя бы одно валидируемое поле показывает ошибку                                                                                                                                        | `boolean` |
| `isDirty`        | Хотя бы одно поле с `field` менялось                                                                                                                                                    | `boolean` |
| `isPristine`     | Ни одно поле с `field` не менялось                                                                                                                                                      | `boolean` |
| `isChanged`      | Хотя бы одно поле отличается от initial                                                                                                                                                 | `boolean` |
| `isValidating`   | Хотя бы одно поле в процессе validate                                                                                                                                                   | `boolean` |
| `canSubmit`      | `!isDisabled && isValid && isChanged && !isValidating`                                                                                                                                  | `boolean` |
| `field(name)`    | Типизированная ссылка на поле (`isMounted`, meta, `validate`, `clearValidateErrors`)                                                                                                    | `FormField` |
| `validate`       | Вся model по `rules`; смонтированные item обновляют UI. `silent: true` — без показа ошибок                                                                                               | `(silent?: boolean) => Promise<boolean>` |
| `validateModel`  | Проверить всю model по `z.object(rules)`, включая несмонтированные поля. Не silent — параллельно громко валидирует смонтированные                                                       | `(silent?: boolean) => Promise<FormModelValidationResult>` |
| `submit`         | Громкая валидация и `onSubmit` с `{ isValid, reset, commit }`                                                                                                                           | `() => Promise<void>` |
| `clearValidate`  | Скрыть статусы и сообщения ошибок у всех полей; `isValid` пересчитывается тихо                                                                                                          | `VoidFunction` |
| `reset`          | Восстановить model к `initial`, очистить валидацию и meta                                                                                                                               | `VoidFunction` |
| `commit`         | Принять текущую model как новый `initial`, очистить валидацию и meta                                                                                                                    | `VoidFunction` |

`form.field('email')` до монтирования item: `isMounted === false`, `isValid === true`, `validate()` → `true`.

### VForm

Тонкая обёртка: нативный `<form novalidate>`, классы, `provide` контроллера, `@submit.prevent="form.submit()"`.

| Имя    | Описание                         | Тип                     | Обязательно |
|--------|----------------------------------|-------------------------|-------------|
| `form` | Контроллер из `useForm()`        | `FormController<MODEL>` | `true`      |

Слот `default` без scope — состояние читается с контроллера.

### VFormItem

Поле формы: связывается через `:field`. UI-обёртка над `Form.Item` — заголовок (`title`), обязательность и вывод ошибок в footer по умолчанию.

| Имя        | Описание                                                          | Тип         | Обязательно |
|------------|-------------------------------------------------------------------|-------------|-------------|
| `field`    | Ссылка `form.field('email')`. Без `field` item не участвует в model / валидации | `FormField` | `false` |
| `title`    | Текст заголовка поля                                              | `string`    | `false`     |
| `disabled` | Отключить поле и исключить его из валидации / `isValid` формы     | `boolean`   | `false`     |

Scope слотов: `{ validationStatus, isRequired, errors, isValid, isDirty, isPristine, isChanged }`.

| Имя       | Описание                                                                                  |
|-----------|-------------------------------------------------------------------------------------------|
| `default` | Контрол поля                                                                              |
| `header`  | Шапка. Если не передан — при наличии `title` рендерится заголовок и `*` для required      |
| `footer`  | Подвал. Если не передан — список ошибок валидации (`Form.ItemErrors`)                     |

События `valid` / `invalid` — только после громкой валидации поля.
