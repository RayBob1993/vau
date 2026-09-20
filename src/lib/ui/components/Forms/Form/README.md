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

## Как устроено

- Каждый `VFormItem` со свойством `name` валидирует **своё** поле: ключ верхнего уровня в `v-model` и в `rules`.
- `isValid` значение из слота формы — агрегат: все смонтированные валидируемые поля прошли проверку (есть rule и поле не disabled).
- `rules` можно задавать частично — не для всех ключей model.
- `name` должен быть **уникален** среди смонтированных item одной формы (в DEV при дубле — `console.warn`).
- `VFormItem` с `title` показывает заголовок и признак обязательности.

## API

### Свойства

| Имя             | Описание                                                                     | Тип                                | Значения | Значение по умолчанию | Обязательно |
|-----------------|------------------------------------------------------------------------------|------------------------------------|----------|-----------------------|-------------|
| `v-model`       | Модель данных (плоский объект)                                               | `FormModel`                        | —        | —                     | `true`      |
| `rules`         | Правила Zod по ключам model (`defineFormRules`)                              | `FormRules<MODEL>`                 | —        | `undefined`           | `false`     |
| `disabled`      | Блокировка формы и полей внутри                                              | `boolean`                          | —        | `false`               | `false`     |
| `scrollToError` | После неуспешного `validate` / submit — скролл к первому ошибочному FormItem | `boolean`, `ScrollIntoViewOptions` | —        | `undefined`           | `false`     |

### Слоты

| Имя       | Описание         | Scope свойства         |
|-----------|------------------|------------------------|
| `default` | Содержимое формы | `{ isValid: boolean }` |

### События

| Имя       | Описание                                      | Параметры                             |
|-----------|-----------------------------------------------|---------------------------------------|
| `submit`  | Отправка формы (после `validate`)             | `FormSubmitEvent` `{ isValid, reset }`|
| `valid`   | Форма прошла валидацию                        | —                                     |
| `invalid` | Форма не прошла валидацию                     | —                                     |

### Методы

| Имя             | Описание                                                                        | Параметры          | Возвращаемое значение |
|-----------------|---------------------------------------------------------------------------------|--------------------|-----------------------|
| `isValid`       | Текущий агрегированный статус формы (ref/computed)                              | —                  | `boolean`             |
| `validate`      | Валидировать все валидируемые FormItem. `silent: true` — без показа ошибок в UI | `silent?: boolean` | `Promise<boolean>`    |
| `clearValidate` | Сбросить статусы и сообщения ошибок у всех полей                                | —                  | —                     |
| `reset`         | Восстановить model к снимку на момент mount и очистить валидацию                | —                  | —                     |
