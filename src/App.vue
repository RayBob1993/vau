<script setup lang="ts">
  import { Form, Select, Input, Checkbox, Radio, Button, Switch, InputNumber, InputPassword, defineFormRules, type FormSubmitEvent } from '@vau/core';
  import '@vau/styles';
  import './lib/styles/base/index.scss';
  import { ref } from 'vue';
  import { z } from 'zod';

  interface FormModel {
    age: number;
    name: string;
    email: string;
    gender: string;
    password: string;
    agree?: boolean;
    skills?: Array<string>;
  }

  const model = ref<Required<FormModel>>({
    age: 0,
    name: '1',
    email: 'test@mail.ru',
    gender: '1',
    password: '',
    agree: false,
    skills: [],
  });

  const rules = defineFormRules<FormModel>({
    age: z.number().int().min(1).max(100),
    name: z.string().nonempty(),
    password: z.string().nonempty(),
    email: z.email().nonempty(),
    gender: z.string().nonempty(),
  });

  function handleSubmit ({ isValid }: FormSubmitEvent) {
    if (isValid) {
      console.log('ОК');
    } else {
      console.log('НЕ ОК');
    }
  }
</script>

<template>
  <Form.Root
    v-slot="{ isValid, reset, isDirty }"
    v-model="model"
    :rules="rules"
    @submit="handleSubmit"
  >
    <Form.Item name="age">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Возраст

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <InputNumber.Root
        v-model="model.age"
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

    <Form.Item name="name">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Имя

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <Input.Root
        v-model="model.name"
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

    <Form.Item name="email">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Email

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <Input.Root
        v-model="model.email"
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

    <Form.Item name="gender">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Пол

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <Radio.Group>
        <Radio.Root
          v-model="model.gender"
          value="1"
        >
          <Radio.Indicator/>

          <Radio.Title>
            Мужчина
          </Radio.Title>
        </Radio.Root>

        <Radio.Root
          v-model="model.gender"
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

    <Form.Item name="gender">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Пол

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <Select.Root
        v-model="model.gender"
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
          v-model="model.skills"
          value="php"
        >
          <Checkbox.Indicator/>

          <Checkbox.Title>
            PHP
          </Checkbox.Title>
        </Checkbox.Root>

        <Checkbox.Root
          v-model="model.skills"
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

    <Form.Item name="password">
      <template #header="{ isRequired }">
        <Form.ItemTitle>
          Пароль

          <Form.ItemRequired v-if="isRequired"/>
        </Form.ItemTitle>
      </template>

      <InputPassword.Root
        v-model="model.password"
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

      <Switch.Root v-model="model.agree">
        <Switch.Indicator/>

        <Switch.Title>
          Согласен
        </Switch.Title>
      </Switch.Root>

      <template #footer>
        <Form.ItemErrors/>
      </template>
    </Form.Item>

    <hr>

    <Button.Root
      type="submit"
      theme="secondary"
      size="medium"
      :disabled="!isValid"
    >
      Отправить
    </Button.Root>

    <Button.Root
      theme="danger"
      size="medium"
      :disabled="!isDirty"
      @click="reset"
    >
      Сброс
    </Button.Root>
  </Form.Root>

  <pre>{{ model }}</pre>
</template>

<style>
body {
  padding: 50px 100px;
}

hr {
  margin: 20px 0;
}
</style>
