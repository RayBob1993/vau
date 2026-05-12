<script setup lang="ts">
  import { Button, Drawer, useToggle } from 'vau';

  const [isVisibleDrawerLeft, setIsVisibleDrawerLeft] = useToggle();
  const [isVisibleDrawerRight, setIsVisibleDrawerRight] = useToggle();
  const [isVisibleDrawerTop, setIsVisibleDrawerTop] = useToggle();
  const [isVisibleDrawerBottom, setIsVisibleDrawerBottom] = useToggle();
</script>

<template>
  <Button.Group direction="horizontal">
    <Button.Root
      theme="base"
      size="medium"
      @click="setIsVisibleDrawerLeft(true)"
    >
      Открыть Drawer Left
    </Button.Root>

    <Button.Root
      theme="base"
      size="medium"
      @click="setIsVisibleDrawerRight(true)"
    >
      Открыть Drawer Right
    </Button.Root>

    <Button.Root
      theme="base"
      size="medium"
      @click="setIsVisibleDrawerTop(true)"
    >
      Открыть Drawer Top
    </Button.Root>

    <Button.Root
      theme="base"
      size="medium"
      @click="setIsVisibleDrawerBottom(true)"
    >
      Открыть Drawer Bottom
    </Button.Root>
  </Button.Group>

  <Drawer.Root
    v-slot="{ close }"
    v-model="isVisibleDrawerLeft"
    position="left"
    size="medium"
  >
    <Drawer.Dialog>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            Drawer Left
          </Drawer.Title>

          <Drawer.Close/>
        </Drawer.Header>

        <Drawer.Body/>

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
    v-model="isVisibleDrawerRight"
    position="right"
    size="medium"
  >
    <Drawer.Dialog>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            Drawer Right
          </Drawer.Title>

          <Drawer.Close/>
        </Drawer.Header>

        <Drawer.Body/>

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
    v-model="isVisibleDrawerTop"
    position="top"
    size="medium"
  >
    <Drawer.Dialog>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            Drawer Top
          </Drawer.Title>

          <Drawer.Close/>
        </Drawer.Header>

        <Drawer.Body/>

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
    v-model="isVisibleDrawerBottom"
    position="bottom"
    size="medium"
  >
    <Drawer.Dialog>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            Drawer Bottom
          </Drawer.Title>

          <Drawer.Close/>
        </Drawer.Header>

        <Drawer.Body/>

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
