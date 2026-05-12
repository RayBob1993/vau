<script setup lang="ts">
  import { Button, Drawer, useToggle } from 'vau';

  const [isVisibleDrawer, setIsVisibleDrawer] = useToggle();
  const [isVisibleNestedDrawer, setIsVisibleNestedDrawer] = useToggle();
</script>

<template>
  <Button.Root
    theme="base"
    size="medium"
    @click="setIsVisibleDrawer(true)"
  >
    Открыть Drawer
  </Button.Root>

  <Drawer.Root
    v-slot="{ close }"
    v-model="isVisibleDrawer"
    size="big"
  >
    <Drawer.Dialog>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            Заголовок
          </Drawer.Title>

          <Drawer.Close/>
        </Drawer.Header>

        <Drawer.Body>
          <Button.Root
            theme="base"
            size="medium"
            @click="setIsVisibleNestedDrawer(true)"
          >
            Открыть вложенный Drawer
          </Button.Root>
        </Drawer.Body>

        <Drawer.Footer>
          <Button.Root
            theme="primary"
            size="medium"
            @click="close"
          >
            Закрыть
          </Button.Root>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Dialog>
  </Drawer.Root>

  <Drawer.Root
    v-slot="{ close }"
    v-model="isVisibleNestedDrawer"
    size="medium"
  >
    <Drawer.Dialog>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            Заголовок вложенного Drawer
          </Drawer.Title>

          <Drawer.Close/>
        </Drawer.Header>

        <Drawer.Body>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio non facere quia a necessitatibus sed consequuntur excepturi nam beatae vitae!
        </Drawer.Body>

        <Drawer.Footer>
          <Button.Root
            theme="primary"
            size="medium"
            @click="close"
          >
            Закрыть
          </Button.Root>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Dialog>
  </Drawer.Root>
</template>
