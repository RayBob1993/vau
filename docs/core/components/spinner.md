# Spinner

## Анатомия

```vue
<script setup lang="ts">
  import { Spinner } from 'vau';
</script>

<template>
  <Spinner.Root/>
</template>
```

## Базовое использование

<v-preview path="examples/core/spinner/SpinnerBase.vue" />

## Theme

Доступные значения `theme`: `base`, `primary`, `secondary`, `tertiary`, `danger`, `success`, `warning`.

<v-preview path="examples/core/spinner/SpinnerTheme.vue" />

## Size

Доступные значения `size`: `mini`, `small`, `medium`, `large`, `big`, `huge`, `massive`.

<v-preview path="examples/core/spinner/SpinnerSize.vue" />

## Spinner API

### Spinner.Root Props
| Имя        | Описание        | Тип                                                                                      | Дефолтное значение |
|------------|-----------------|------------------------------------------------------------------------------------------|--------------------|
| `theme`    | Тема оформления | `'base' \| 'primary' \| 'secondary' \| 'tertiary' \| 'danger' \| 'success' \| 'warning'` | `—`                |
| `size`     | Базовый размер  | `'mini' \| 'small' \| 'medium' \| 'large' \| 'big' \| 'huge' \| 'massive'`               | `—`                |
