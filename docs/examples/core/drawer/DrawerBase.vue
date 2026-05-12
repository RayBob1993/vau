<script setup lang="ts">
  import { Button, Drawer, useToggle } from 'vau';

  const [isVisibleDrawer, setIsVisibleDrawer] = useToggle();
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
    size="medium"
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
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium ad aperiam asperiores aspernatur consequuntur, eligendi esse fuga fugiat hic laboriosam magni maxime necessitatibus obcaecati quis ratione repellat reprehenderit, sapiente similique sit suscipit tempora voluptate, voluptates. Cupiditate deserunt esse est, facilis labore magni necessitatibus quas quia quo saepe sapiente vel voluptatibus voluptatum! Alias aperiam corporis culpa delectus dolore, dolorem doloremque ducimus earum eos error expedita inventore ipsum iusto, laboriosam magnam minus modi nulla perspiciatis provident quas quia quis saepe sapiente, ut veniam voluptate voluptates. Accusamus, accusantium dolore doloribus eum, expedita fuga laborum maiores pariatur placeat quod recusandae repellendus ullam vel. Assumenda earum eligendi iure iusto numquam quae quis reprehenderit sapiente, sunt ullam? Consequuntur debitis facere in libero necessitatibus nesciunt ratione veniam. Accusantium adipisci alias aperiam atque distinctio eaque et fuga impedit itaque magnam, natus, necessitatibus nemo officia officiis perferendis perspiciatis placeat praesentium quidem quisquam quos recusandae rem rerum sapiente temporibus voluptatum! Blanditiis culpa debitis delectus ducimus eveniet excepturi iure necessitatibus. Alias animi consectetur dicta dolore ex impedit ipsa laborum molestiae nulla quae quisquam quo, reiciendis rem. Aliquam asperiores dolorum eius fugiat incidunt iste labore minus neque quia quod! Architecto laboriosam molestias odit sit temporibus totam ut. Ad culpa dolor enim id minus? Assumenda excepturi explicabo facilis quis sunt. Accusamus aperiam, aspernatur aut eligendi magnam nesciunt quod. Dignissimos dolor illo impedit ipsa itaque, libero maiores temporibus totam vero vitae. Dolore eaque esse est facere in nobis quae tempora vel! Adipisci architecto asperiores aspernatur beatae consequuntur corporis culpa cum cumque dignissimos error, excepturi facere fuga hic illo ipsam maiores minus molestiae praesentium provident quia quisquam quod reiciendis rem sapiente sint, sunt tempora tenetur ullam, voluptatibus voluptatum. Corporis deleniti distinctio esse illum natus nemo odio quasi quisquam. Facere magnam maxime porro quam sequi tenetur. Cupiditate earum in magni nam natus quisquam recusandae veniam voluptas?
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
