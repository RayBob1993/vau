<script setup lang="ts" generic="MODEL extends FormModel">
  import type { FormControllerInternal, FormModel, FormProps, FormSlots } from './types';
  import { FormRootContextKey } from './context';
  import { nextTick, onMounted, onUnmounted, provide } from 'vue';

  const props = defineProps<FormProps<MODEL>>();

  defineSlots<FormSlots>();

  /**
   * Хост контроллера: рендерит `<form>`, провайдит контроллер полям,
   * регистрируется в контроллере на mount. Вся логика формы — в `useForm()`.
   */
  const form = props.form as FormControllerInternal<MODEL>;

  provide(FormRootContextKey, form);

  onMounted(async () => {
    await nextTick();

    /* FormItem к этому моменту зарегистрированы и сами делают silent-parse. */
    form.registerForm();
  });

  onUnmounted(() => {
    form.unregisterForm();
  });
</script>

<template>
  <form
    class="form"
    novalidate
    :class="{
      'form--disabled': form.isDisabled,
      'form--dirty': form.isDirty,
      'form--changed': form.isChanged,
      'form--validating': form.isValidating,
      'form--invalid': form.hasErrors
    }"
    @submit.prevent="form.submit()"
  >
    <slot/>
  </form>
</template>
