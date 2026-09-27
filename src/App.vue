<script setup lang="ts">
  import {
    Form,
    Select,
    Input,
    Checkbox,
    Radio,
    Button,
    Switch,
    InputNumber,
    InputPassword,
    defineFormRules,
    useForm,
    type FormModelValidationResult,
  } from '@vau/core';
  import './lib/styles/core/index.scss';
  import { ref } from 'vue';
  import { z } from 'zod';

  interface FormModel {
    age: number;
    name: string;
    lastName: string;
    middleName: string;
    email: string;
    gender: string;
    password: string;
    agree: boolean;
    skills: Array<string>;
  }

  const notLastName = ref<boolean>(false);

  const modelCheck = ref<FormModelValidationResult<FormModel> | null>(null);

  //автотипы

  const form = useForm<FormModel>({
    disabled: true,
    model: {
      age: 33,
      name: 'Дима',
      lastName: 'Паутов',
      middleName: 'ывамывам',
      email: 'test@mail.ru',
      gender: '1',
      password: '123qwerty',
      agree: false,
      skills: [],
    },
    rules: defineFormRules<FormModel>({
      age: z.number().int().min(1).max(100),
      name: z.string().nonempty(),
      lastName: z.string().nonempty(),
      middleName: z.string().nonempty().min(5),
      password: z.string().nonempty(),
      email: z.email().nonempty(),
      gender: z.string().nonempty(),
    }),
    scrollToError: true,
    onSubmit: ({ isValid, commit }) => {
      if (isValid) {
        console.log('ОК', form.model);

        commit();
      } else {
        console.log('НЕ ОК');
      }
    },
  });

  /** Проверка всей model по схеме — включая скрытое через v-if «Отчество». */
  async function checkModel () {
    modelCheck.value = await form.validateModel();
  }
</script>

<template>
  <Form.Root :form="form">
    <Form.Item :field="form.field('age')">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Возраст

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <InputNumber.Root
        v-model="form.model.age"
        :min="1"
        :max="100"
        mousewheel
      >
        <InputNumber.Button action="decrement"/>

        <InputNumber.Input/>

        <InputNumber.Button action="increment"/>
      </InputNumber.Root>

      <template #footer>
        <Form.ItemErrors/>
      </template>
    </Form.Item>

    <hr>

    <Form.Item :field="form.field('name')">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Имя

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <Input.Root
        v-model="form.model.name"
        clearable
      >
        <Input.Control>
          <Input.Native/>
        </Input.Control>

        <Input.After/>
      </Input.Root>

      <template #footer>
        <Form.ItemErrors/>
      </template>
    </Form.Item>

    <hr>

    <Form.Item :field="form.field('lastName')">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Фамилия

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <Input.Root
        v-model="form.model.lastName"
        clearable
      >
        <Input.Control>
          <Input.Native/>
        </Input.Control>

        <Input.After/>
      </Input.Root>

      <template #footer>
        <Form.ItemErrors/>
      </template>
    </Form.Item>

    <hr>

    <Form.Item
      v-if="!notLastName"
      :field="form.field('middleName')"
    >
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Отчество

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <Input.Root
        v-model="form.model.middleName"
        clearable
      >
        <Input.Control>
          <Input.Native/>
        </Input.Control>

        <Input.After/>
      </Input.Root>

      <template #footer>
        <Form.ItemErrors/>
      </template>
    </Form.Item>

    <Switch.Root v-model="notLastName">
      <Switch.Indicator/>

      <Switch.Title>
        {{ notLastName ? 'Указать фамилию' : 'Нет фамилии' }}
      </Switch.Title>
    </Switch.Root>

    <hr>

    <Form.Item :field="form.field('email')">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Email

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <Input.Root
        v-model="form.model.email"
        native-type="email"
      >
        <Input.Control>
          <Input.Native/>
        </Input.Control>
      </Input.Root>

      <template #footer>
        <Form.ItemErrors/>
      </template>
    </Form.Item>

    <hr>

    <Form.Item :field="form.field('gender')">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Пол

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <Radio.Group>
        <Radio.Root
          v-model="form.model.gender"
          value="1"
        >
          <Radio.Indicator/>

          <Radio.Title>
            Мужчина
          </Radio.Title>
        </Radio.Root>

        <Radio.Root
          v-model="form.model.gender"
          value="2"
        >
          <Radio.Indicator/>

          <Radio.Title>
            Женщина
          </Radio.Title>
        </Radio.Root>
      </Radio.Group>

      <template #footer>
        <Form.ItemErrors/>
      </template>
    </Form.Item>

    <hr>

    <Form.Item :field="form.field('gender')">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Пол

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <Select.Root
        v-model="form.model.gender"
        placeholder="Выберите пол"
      >
        <Select.Trigger>
          <Select.Value/>
        </Select.Trigger>

        <Select.Dropdown>
          <Select.Option
            v-slot="{ isActive }"
            value="1"
          >
            <Checkbox.Root :checked="isActive">
              <Checkbox.Indicator/>
            </Checkbox.Root>

            Мужчина
          </Select.Option>

          <Select.Option
            v-slot="{ isActive }"
            value="2"
          >
            <Checkbox.Root :checked="isActive">
              <Checkbox.Indicator/>
            </Checkbox.Root>

            Женщина
          </Select.Option>
        </Select.Dropdown>
      </Select.Root>

      <template #footer>
        <Form.ItemErrors/>
      </template>
    </Form.Item>

    <hr>

    <Form.Item>
      <template #header>
        <Form.ItemTitle>
          Скилы
        </Form.ItemTitle>
      </template>

      <Checkbox.Group>
        <Checkbox.Root
          v-model="form.model.skills"
          value="php"
        >
          <Checkbox.Indicator/>

          <Checkbox.Title>
            PHP
          </Checkbox.Title>
        </Checkbox.Root>

        <Checkbox.Root
          v-model="form.model.skills"
          value="js"
        >
          <Checkbox.Indicator/>

          <Checkbox.Title>
            JS
          </Checkbox.Title>
        </Checkbox.Root>
      </Checkbox.Group>

      <template #footer>
        <Form.ItemErrors/>
      </template>
    </Form.Item>

    <hr>

    <Form.Item :field="form.field('password')">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Пароль

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <InputPassword.Root
        v-model="form.model.password"
        clearable
      />

      <template #footer>
        <Form.ItemErrors/>
      </template>
    </Form.Item>

    <hr>

    <Form.Item>
      <template #header>
        <Form.ItemTitle>
          Согласие
        </Form.ItemTitle>
      </template>

      <Switch.Root v-model="form.model.agree">
        <Switch.Indicator/>

        <Switch.Title>
          Согласен
        </Switch.Title>
      </Switch.Root>

      <template #footer>
        <Form.ItemErrors/>
      </template>
    </Form.Item>
  </Form.Root>

  <hr>

  <!-- Кнопки вне <form>: управление через контроллер, без ref / defineExpose -->
  <div class="actions">
    <Button.Root
      :disabled="!form.canSubmit"
      @click="form.submit()"
    >
      Отправить
    </Button.Root>

    <Button.Root
      :disabled="!form.isChanged"
      @click="form.reset()"
    >
      Сбросить
    </Button.Root>

    <Button.Root @click="form.clearValidate()">
      Очистить ошибки
    </Button.Root>

    <Button.Root @click="checkModel">
      Проверить всю model
    </Button.Root>
  </div>

  <pre>{{ {
    isBound: form.isBound,
    isValid: form.isValid,
    hasErrors: form.hasErrors,
    isDirty: form.isDirty,
    isChanged: form.isChanged,
    isValidating: form.isValidating,
    canSubmit: form.canSubmit,
    middleName: {
      isMounted: form.field('middleName').isMounted,
      isValid: form.field('middleName').isValid,
      isRequired: form.field('middleName').isRequired
    }
  } }}</pre>

  <pre v-if="modelCheck">validateModel: {{ modelCheck }}</pre>

  <pre>{{ form.model }}</pre>
</template>

<style>
:root,
:host {
  --spinner-size: 24px;
  --spinner-border-size: 2px;
  --spinner-color: #000;

  --modal-background-color: rgba(0,0,0,.4);
  --modal-content-background-color: #fff;
  --modal-dialog-width: 400px;

  --drawer-background-color: rgba(0,0,0,.4);
  --drawer-content-background-color: #fff;
  --drawer-dialog-width: 400px;
}

body {
  padding: 20px;
}

hr {
  margin: 20px 0;
}

.actions {
  display: flex;
  gap: 8px;
  max-width: 900px;
  margin: 0 auto;
}

.form {
  max-width: 900px;
  margin: 0 auto;
}

.input {
  --input-border-size: 1px;
  --input-border-color: #000;
  --input-border-radius: 4px;
}

.input-number {
  --input-number-size: 1px;
  --input-number-color: #000;
}

.select {
  --select-border-size: 1px;
  --select-border-color: #000;
}

.button {
  --button-border-width: 1px;
  --button-border-color: #000;
}

.form-item-errors__item {
  color: red;
}
</style>
