# VForm

Форма с валидацией на **Zod**.

## Базовое использование

```vue
<script lang="ts" setup>
  import {
    type FormSubmitEvent,
    VForm,
    VFormItem,
    VInput,
    VCheckbox,
    VButton,
    defineFormRules
  } from 'vau';
  import { ref } from 'vue';
  import { z } from 'zod';

  interface FormModel {
    name: string;
    email: string;
    policy: boolean;
  }

  const model = ref<FormModel>({
    name: '',
    email: '',
    policy: false
  });

  const rules = defineFormRules<FormModel>({
    name: z.string().nonempty({
      error: 'Поле обязательно для заполнения'
    }),
    email: z.email({
      error: 'Неверный формат email'
    }),
    policy: z.literal(true, {
      error: 'Необходимо согласие'
    })
  });

  function handleSubmit ({ isValid, reset }: FormSubmitEvent) {
    if (isValid) {
      console.log('Валидация прошла успешно');
      reset();
    } else {
      console.log('Валидация не прошла');
    }
  }
</script>

<template>
  <v-form
    v-slot="{ isValid }"
    v-model="model"
    :rules="rules"
    scroll-to-error
    @submit="handleSubmit"
  >
    <v-form-item
      title="Имя"
      name="name"
    >
      <v-input v-model="model.name"/>
    </v-form-item>

    <v-form-item
      title="Email"
      name="email"
    >
      <v-input
        v-model="model.email"
        native-type="email"
      />
    </v-form-item>

    <v-form-item name="policy">
      <v-checkbox v-model="model.policy">
        Согласие на обработку данных
      </v-checkbox>
    </v-form-item>

    <v-button
      type="submit"
      :disabled="!isValid"
    >
      Отправить
    </v-button>
  </v-form>
</template>
```

## Динамические поля

Валидируются только **смонтированные** FormItem. Поле под `v-if="false"` снимается с регистрации и не влияет на `isValid` / `validate`, даже если в `model` и `rules` ключ остался.

```vue
<script lang="ts" setup>
  import {
    type FormSubmitEvent,
    VForm,
    VFormItem,
    VInput,
    VCheckbox,
    VButton,
    defineFormRules
  } from 'vau';
  import { ref } from 'vue';
  import { z } from 'zod';

  interface FormModel {
    name: string;
    company: string;
  }

  const model = ref<FormModel>({
    name: '',
    company: ''
  });

  const isLegalEntity = ref<boolean>(false);

  const rules = defineFormRules<FormModel>({
    name: z.string().nonempty({
      error: 'Поле обязательно для заполнения'
    }),
    company: z.string().nonempty({
      error: 'Укажите название компании'
    })
  });

  function handleSubmit ({ isValid }: FormSubmitEvent) {
    console.log(isValid ? 'ОК' : 'Ошибки');
  }
</script>

<template>
  <v-form
    v-slot="{ isValid }"
    v-model="model"
    :rules="rules"
    @submit="handleSubmit"
  >
    <v-form-item
      title="Имя"
      name="name"
    >
      <v-input v-model="model.name"/>
    </v-form-item>

    <v-checkbox v-model="isLegalEntity">
      Юридическое лицо
    </v-checkbox>

    <v-form-item
      v-if="isLegalEntity"
      title="Компания"
      name="company"
    >
      <v-input v-model="model.company"/>
    </v-form-item>

    <v-button
      type="submit"
      :disabled="!isValid"
    >
      Отправить
    </v-button>
  </v-form>
</template>
```

Пока `isLegalEntity === false`, для кнопки достаточно валидного `name`: правило `company` в `rules` есть, но FormItem не смонтирован. После включения чекбокса `company` снова участвует в валидации.

## Правила: `defineFormRules` и `computed`

`defineFormRules` оборачивает словарь Zod в `markRaw`: схемы не становятся глубоко реактивными (Proxy ломает Zod и даёт лишний трекинг). Реактивность нужна у `v-model`, а не у самих схем.

### Статический объект

Подходит, когда набор и ограничения полей **не меняются** после создания формы:

```ts
const rules = defineFormRules<FormModel>({
  name: z.string().nonempty({ error: 'Обязательно' }),
  email: z.email({ error: 'Неверный email' })
});
```

Ссылка на объект `rules` постоянна. FormItem один раз подхватывает схему при mount и дальше реагирует на изменение **значения** поля.

### `computed` + `defineFormRules`

Нужен, когда схема зависит от внешнего состояния (длина, режим, связанные поля и т.п.):

```ts
const minNameLength = ref(3);

const rules = computed(() =>
  defineFormRules<FormModel>({
    name: z.string().min(minNameLength.value, {
      error: `Минимум ${minNameLength.value} символа`
    }),
    email: z.email({ error: 'Неверный email' })
  })
);
```

При смене зависимостей `computed` возвращает **новый** объект rules → FormItem видит новую Zod-схему и пересчитывает статус:

- ошибки ещё не показаны — тихая проверка (`isValid` / кнопка submit обновляются без красных сообщений);
- поле уже в ошибке — обычная валидация, текст ошибок подтягивается под новые ограничения.

Без `computed` смена «логики» правил (мутация старого объекта или замена схемы «вручную» без реактивной обёртки) **не** обновит `isFieldValid` и UI: Form следит за сменой ссылки на rule у поля, а не за внутренностями Zod.

Кратко:

| Способ                                     | Когда                                           | Реакция на смену ограничений        |
|--------------------------------------------|-------------------------------------------------|-------------------------------------|
| `defineFormRules({ ... })`                 | Фиксированные правила                           | Нет — схема одна на весь срок жизни |
| `computed(() => defineFormRules({ ... }))` | Правила зависят от `ref` / props / других полей | Да — silent или с ошибками в UI     |

## Как устроено

- Каждый `VFormItem` со свойством `name` валидирует **своё** поле: ключ верхнего уровня в `v-model` и в `rules`.
- `isValid` значение из слота формы — агрегат: все смонтированные валидируемые поля прошли проверку (есть rule и поле не disabled).
- Meta-флаги поля и формы: `isDirty` / `isPristine` / `isChanged` (см. раздел ниже).
- `rules` можно задавать частично — не для всех ключей model.
- `name` должен быть **уникален** среди смонтированных item одной формы (в DEV при дубле — `console.warn`).
- `VFormItem` с `title` показывает заголовок и признак обязательности.
- Статические `rules` — через `defineFormRules`; динамические ограничения — `computed(() => defineFormRules(...))` (см. раздел выше).

## Meta: dirty / pristine / changed

Для смонтированных `FormItem` с `name`:

| Флаг         | Поле                                                         | Форма                                                       |
|--------------|--------------------------------------------------------------|-------------------------------------------------------------|
| `isDirty`    | Значение менялось хотя бы раз (липкий до `reset` формы)      | Хотя бы одно поле dirty                                     |
| `isPristine` | Значение никогда не меняли (`!isDirty`)                      | Все поля pristine                                           |
| `isChanged`  | Текущее значение ≠ снимок `initial` на mount                 | Хотя бы одно поле changed                                   |
| `isValid`    | Логический результат parse (для невалидируемых — `true`)     | Агрегат валидируемых полей; до готовности реестра — `false` |
| `canSubmit`  | —                                                            | `isValid && isChanged` — для `:disabled="!canSubmit"`        |

`Form.reset()` возвращает model к снимку mount и сбрасывает `isDirty` у полей.

Доступ: слот формы / `FormItem`, классы `form--dirty` / `form--changed` / `form-item--dirty` / `form-item--changed`, expose формы. Класс `form--invalid` ставится только когда реестр готов и `isValid === false` (чтобы не вспыхивать при mount).

### Пример: сохранить / сбросить / индикатор изменений

Типичный сценарий редактирования:

- **Сохранить** — `canSubmit` (`isValid && isChanged`);
- **Сбросить** — поле хотя бы раз трогали (`isDirty`);
- подсказка «есть несохранённые изменения» — по `isChanged` (вернули значение к initial → подсказка пропадает; `isDirty` остаётся `true` до `reset`).

```vue
<script lang="ts" setup>
  import {
    type FormInstance,
    type FormSubmitEvent,
    VForm,
    VFormItem,
    VInput,
    VButton,
    defineFormRules
  } from 'vau';
  import { ref, useTemplateRef } from 'vue';
  import { z } from 'zod';

  interface FormModel {
    name: string;
    email: string;
  }

  const model = ref<FormModel>({
    name: 'Иван',
    email: 'ivan@example.com'
  });

  const formRef = useTemplateRef<FormInstance>('formRef');

  const rules = defineFormRules<FormModel>({
    name: z.string().nonempty({
      error: 'Укажите имя'
    }),
    email: z.email({
      error: 'Неверный email'
    })
  });

  function handleSubmit ({ isValid, reset }: FormSubmitEvent) {
    if (!isValid) {
      return;
    }

    // сохранить model на сервер…
    reset(); // после успеха — новый initial и чистая meta
  }

  function handleReset () {
    formRef.value?.reset();
  }
</script>

<template>
  <v-form
    ref="formRef"
    v-slot="{ canSubmit, isDirty, isChanged }"
    v-model="model"
    :rules="rules"
    @submit="handleSubmit"
  >
    <v-form-item
      v-slot="{ isChanged: nameChanged }"
      title="Имя"
      name="name"
    >
      <v-input v-model="model.name"/>
      <span
        v-if="nameChanged"
        class="hint"
      >
        изменено
      </span>
    </v-form-item>

    <v-form-item
      title="Email"
      name="email"
    >
      <v-input
        v-model="model.email"
        native-type="email"
      />
    </v-form-item>

    <p v-if="isChanged">
      Есть несохранённые изменения
    </p>

    <v-button
      type="submit"
      :disabled="!canSubmit"
    >
      Сохранить
    </v-button>

    <v-button
      type="button"
      :disabled="!isDirty"
      @click="handleReset"
    >
      Сбросить
    </v-button>
  </v-form>
</template>
```

Кратко по сценарию:

1. Открыли форму → `isPristine`, `!isChanged`; `isValid` зависит от данных.
2. Изменили имя → `isDirty`, `isChanged`, при валидности `canSubmit`; «Сохранить» активна.
3. Вернули имя как было → `isDirty` всё ещё `true`, `canSubmit === false` → «Сохранить» снова disabled, подсказка скрыта.
4. `reset()` / успешный submit с `reset()` → model = initial, `isDirty` сброшен.

### Пример: `ref` на FormItem

Слот удобен в шаблоне; `ref` — когда логика в script: проверить одно поле перед запросом, сбросить ошибки поля, прочитать meta без лишнего scope.

```vue
<script lang="ts" setup>
  import {
    type FormItemInstance,
    type FormSubmitEvent,
    VForm,
    VFormItem,
    VInput,
    VButton,
    defineFormRules
  } from 'vau';
  import { ref, useTemplateRef } from 'vue';
  import { z } from 'zod';

  interface FormModel {
    email: string;
    code: string;
  }

  const model = ref<FormModel>({
    email: '',
    code: ''
  });

  const emailItemRef = useTemplateRef<FormItemInstance>('emailItemRef');

  const isCodeStep = ref(false);
  const isCheckingEmail = ref(false);

  const rules = defineFormRules<FormModel>({
    email: z.email({
      error: 'Неверный email'
    }),
    code: z.string().length(6, {
      error: 'Код из 6 символов'
    })
  });

  /**
   * Валидируем только email, затем свой запрос —
   * без полного submit формы и без показа ошибок у code.
   */
  async function goToCodeStep () {
    const emailOk = await emailItemRef.value?.validate();

    if (!emailOk) {
      return;
    }

    isCheckingEmail.value = true;

    try {
      // await api.sendCode(model.value.email)
      isCodeStep.value = true;
    } finally {
      isCheckingEmail.value = false;
    }
  }

  function backToEmail () {
    isCodeStep.value = false;
    // убрать ошибки code, если успели показать
    // (model.code можно очистить отдельно)
  }

  function handleSubmit ({ isValid }: FormSubmitEvent) {
    if (isValid) {
      console.log('вход', model.value);
    }
  }
</script>

<template>
  <v-form
    v-model="model"
    :rules="rules"
    @submit="handleSubmit"
  >
    <v-form-item
      ref="emailItemRef"
      title="Email"
      name="email"
    >
      <v-input
        v-model="model.email"
        native-type="email"
        :disabled="isCodeStep"
      />
    </v-form-item>

    <v-form-item
      v-if="isCodeStep"
      title="Код"
      name="code"
    >
      <v-input v-model="model.code"/>
    </v-form-item>

    <v-button
      v-if="!isCodeStep"
      type="button"
      :loading="isCheckingEmail"
      @click="goToCodeStep"
    >
      Получить код
    </v-button>

    <template v-else>
      <v-button
        type="button"
        @click="backToEmail"
      >
        Назад
      </v-button>
      <v-button type="submit">
        Войти
      </v-button>
    </template>
  </v-form>
</template>
```

Через тот же `ref` доступны meta и методы поля: `emailItemRef.value?.isChanged`, `clearValidateErrors()`, `reset()` (только UI-статус валидации поля; model сбрасывает `VForm.reset`).

## API

### VForm

#### Свойства

| Имя             | Описание                                                                     | Тип                                | Значения | Значение по умолчанию | Обязательно |
|-----------------|------------------------------------------------------------------------------|------------------------------------|----------|-----------------------|-------------|
| `v-model`       | Модель данных (плоский объект)                                               | `FormModel`                        | —        | —                     | `true`      |
| `rules`         | Правила Zod по ключам model (`defineFormRules`)                              | `FormRules<MODEL>`                 | —        | `undefined`           | `false`     |
| `disabled`      | Блокировка формы и полей внутри                                              | `boolean`                          | —        | `false`               | `false`     |
| `scrollToError` | После неуспешного `validate` / submit — скролл к первому ошибочному FormItem | `boolean`, `ScrollIntoViewOptions` | —        | `undefined`           | `false`     |

#### Слоты

| Имя       | Описание         | Scope свойства                                           |
|-----------|------------------|----------------------------------------------------------|
| `default` | Содержимое формы | `{ isValid, isDirty, isPristine, isChanged, canSubmit }` |

#### События

| Имя       | Описание                          | Параметры                              |
|-----------|-----------------------------------|----------------------------------------|
| `submit`  | Отправка формы (после `validate`) | `FormSubmitEvent` `{ isValid, reset }` |
| `valid`   | Форма прошла валидацию            | —                                      |
| `invalid` | Форма не прошла валидацию         | —                                      |

#### Методы

| Имя             | Описание                                                                        | Параметры          | Возвращаемое значение |
|-----------------|---------------------------------------------------------------------------------|--------------------|-----------------------|
| `isValid`       | Агрегированный статус валидации (до готовности реестра — `false`)               | —                  | `boolean`             |
| `isDirty`       | Хотя бы одно поле с `name` менялось                                             | —                  | `boolean`             |
| `isPristine`    | Ни одно поле с `name` не менялось                                               | —                  | `boolean`             |
| `isChanged`     | Хотя бы одно поле отличается от initial                                         | —                  | `boolean`             |
| `canSubmit`     | `isValid && isChanged` — удобно для кнопки «Сохранить»                          | —                  | `boolean`             |
| `validate`      | Валидировать все валидируемые FormItem. `silent: true` — без показа ошибок в UI | `silent?: boolean` | `Promise<boolean>`    |
| `clearValidate` | Сбросить статусы и сообщения ошибок у всех полей                                | —                  | —                     |
| `reset`         | Восстановить model к снимку mount, очистить валидацию и meta (`isDirty`)        | —                  | —                     |

### VFormItem

Поле формы: связывается по ключу `name` с model и `rules`. UI-обёртка над `Form.Item` — заголовок (`title`), обязательность и вывод ошибок в footer по умолчанию.

#### Свойства

| Имя        | Описание                                                                   | Тип       | Значения | Значение по умолчанию | Обязательно |
|------------|----------------------------------------------------------------------------|-----------|----------|-----------------------|-------------|
| `name`     | Ключ поля в model и rules (верхний уровень). Уникален в рамках одной формы | `string`  | —        | `undefined`           | `false`     |
| `title`    | Текст заголовка поля (в header вместе с признаком обязательности)          | `string`  | —        | `undefined`           | `false`     |
| `disabled` | Отключить поле и исключить его из валидации / `isValid` формы              | `boolean` | —        | `false`               | `false`     |

#### Слоты

Scope у всех слотов: `{ validationStatus, isRequired, errors, isValid, isDirty, isPristine, isChanged }`.

| Имя       | Описание                                                                                  | Scope по умолчанию |
|-----------|-------------------------------------------------------------------------------------------|--------------------|
| `default` | Контрол поля                                                                              | —                  |
| `header`  | Шапка поля. Если не передан — при наличии `title` рендерится заголовок и `*` для required | —                  |
| `footer`  | Подвал поля. Если не передан — список ошибок валидации (`Form.ItemErrors`)                | —                  |

#### События

| Имя       | Описание                 | Параметры |
|-----------|--------------------------|-----------|
| `valid`   | Поле прошло валидацию    | —         |
| `invalid` | Поле не прошло валидацию | —         |

#### Методы

| Имя                   | Описание                                                                  | Параметры          | Возвращаемое значение |
|-----------------------|---------------------------------------------------------------------------|--------------------|-----------------------|
| `isValid`             | Логический результат parse поля (невалидируемое — `true`)                 | —                  | `boolean`             |
| `isDirty`             | Значение поля менялось хотя бы раз                                        | —                  | `boolean`             |
| `isPristine`          | Значение поля никогда не меняли                                           | —                  | `boolean`             |
| `isChanged`           | Текущее значение ≠ initial                                                | —                  | `boolean`             |
| `validate`            | Валидировать поле. `silent: true` — без показа ошибок в UI                | `silent?: boolean` | `Promise<boolean>`    |
| `clearValidateErrors` | Сбросить статус и сообщения ошибок поля                                   | —                  | —                     |
| `reset`               | Сбросить UI-статус валидации поля (model сбрасывает только `VForm.reset`) | —                  | —                     |
