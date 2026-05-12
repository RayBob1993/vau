# Drawer

## Анатомия

```vue
<script setup lang="ts">
  import { Drawer } from 'vau';
</script>

<template>
  <Drawer.Root>
    <Drawer.Dialog>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title/>
          <Drawer.Close/>
        </Drawer.Header>
        
        <Drawer.Body/>
        
        <Drawer.Footer/>
      </Drawer.Content>
    </Drawer.Dialog>
  </Drawer.Root>
</template>
```

## Базовое использование

<v-preview path="examples/core/drawer/DrawerBase.vue" />

## Position

<v-preview path="examples/core/drawer/DrawerPosition.vue" />

## Вложенные Drawer

<v-preview path="examples/core/drawer/DrawerNested.vue" />

## Drawer API

### Drawer.Root Props

| Имя             | Описание                               | Тип                                                                        | Дефолтное значение |
|-----------------|----------------------------------------|----------------------------------------------------------------------------|--------------------|
| `position`      | Положение Drawer                       | `'left' \| 'right' \| 'top' \| 'bottom'`                                   | `'left'`           |
| `appendToBody`  | Добавлять Drawer в body                | `boolean`                                                                  | `true`             |
| `closeOnEscape` | Закрывать Drawer при нажатии на Escape | `boolean`                                                                  | `true`             |
| `size`          | Базовый размер                         | `'mini' \| 'small' \| 'medium' \| 'large' \| 'big' \| 'huge' \| 'massive'` | `—`                |

### Drawer.Root Emits

| Имя        | Описание                                                                  | Тип                          |
|------------|---------------------------------------------------------------------------|------------------------------|
| `opened`   | Событие, которое вызывается при открытии Drawer после окончания анимации  | `(payload: Element) => void` |
| `closed`   | Событие, которое вызывается при закрытии Drawer после окончания анимации  | `(payload: Element) => void` |
| `open`     | Событие, которое вызывается при открытии Drawer                           | `() => void`                 |
| `close`    | Событие, которое вызывается при закрытии Drawer                           | `() => void`                 |

### Drawer.Root Slots

| Имя       | Описание                                    |
|-----------|---------------------------------------------|
| `default` | Контент Drawer (текст, произвольный шаблон) |
