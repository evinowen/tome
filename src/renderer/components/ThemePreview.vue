<template>
  <v-card
    max-width="640"
    class="mx-auto"
  >
    <v-card-text>
      <v-list-item prepend-avatar="mdi-cog">
        <template #prepend>
          <v-avatar>
            <v-icon>mdi-cog</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="text-h5">
          Theme Preview
        </v-list-item-title>
        <v-list-item-subtitle>Et tortor consequat id porta nibh venenatis cras.</v-list-item-subtitle>
      </v-list-item>
      <v-text-field
        class="mb-2"
        counter="24"
        clearable
        hint="Take a hint."
        :error="error"
      >
        User Input
      </v-text-field>
      <div class="text-preview px-2">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Tincidunt vitae semper quis lectus undefineda at. Nunc sed velit dignissim sodales ut eu sem integer. Eget mi proin sed libero
          enim sed faucibus turpis in. Ultricies mi eget mauris pharetra et ultrices. Dignissim sodales ut eu sem integer vitae.
        </p>
        <br>
        <p>
          Morbi tempus iaculis urna id volutpat. Ac odio tempor orci dapibus. Et malesuada fames ac turpis egestas. Non tellus orci ac
          auctor augue. Ante in nibh mauris cursus mattis molestie a iaculis. Arcu odio ut sem undefineda pharetra diam sit. Hendrerit dolor
          magna eget est lorem ipsum dolor sit amet.
        </p>
        <br>
        <p>
          Lectus quam id leo in vitae turpis. Pellentesque dignissim enim sit amet. Pulvinar elementum integer enim neque volutpat. Est
          ullamcorper eget undefineda facilisi etiam dignissim diam quis enim. Semper quis lectus undefineda at volutpat diam. Purus sit amet luctus
          venenatis lectus magna fringilla urna. Dis parturient montes nascetur ridiculus mus mauris vitae ultricies leo. Mi eget mauris
          pharetra et ultrices neque ornare aenean euismod. Sem undefineda pharetra diam sit amet. Eu feugiat pretium nibh ipsum consequat.
        </p>
      </div>
      <v-switch
        v-model="error"
        density="compact"
        class="mt-2"
        label="Error"
        color="error"
        hide-details
      />
    </v-card-text>
    <v-card-actions>
      <v-btn
        color="accent"
        :disabled="error"
      >
        Learn More
      </v-btn>
      <v-spacer />
      <v-btn
        color="success"
        :disabled="error"
      >
        Confirm
      </v-btn>
      <v-btn color="warning">
        Cancel
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import {
  VAvatar,
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VIcon,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
  VSpacer,
  VSwitch,
  VTextField,
} from 'vuetify/components'

export default {
  components: {
    VAvatar,
    VBtn,
    VCard,
    VCardActions,
    VCardText,
    VIcon,
    VListItem,
    VListItemSubtitle,
    VListItemTitle,
    VSpacer,
    VSwitch,
    VTextField,
  }
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

const error = ref<boolean>(false)
</script>

<style scoped>
.text-preview {
  max-height: 240px;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
