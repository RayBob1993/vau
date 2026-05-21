<script setup lang="ts">
  import { Button } from 'vau';
</script>

<template>
  <Button.Root
    theme="base"
    size="mini"
    loading
  >
    Mini
  </Button.Root>

  <Button.Root
    theme="primary"
    size="small"
    class="m-l-8"
    loading
  >
    Small
  </Button.Root>

  <Button.Root
    theme="secondary"
    size="medium"
    class="m-l-8"
    loading
  >
    Medium
  </Button.Root>

  <Button.Root
    theme="tertiary"
    size="large"
    class="m-l-8"
    loading
  >
    Large
  </Button.Root>

  <Button.Root
    theme="danger"
    size="big"
    class="m-l-8"
    loading
  >
    Big
  </Button.Root>

  <Button.Root
    theme="success"
    size="huge"
    class="m-l-8"
    loading
  >
    Huge
  </Button.Root>

  <Button.Root
    theme="warning"
    size="massive"
    class="m-l-8"
    loading
  >
    Massive
  </Button.Root>
</template>
