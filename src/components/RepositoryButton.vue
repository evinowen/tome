<template>
  <v-menu top offset-y transition="slide-y-reverse-transition">

    <template v-slot:activator="{ on: on_click }">
      <v-tooltip top>
        <template v-slot:activator="{ on: on_hover }">
          <v-btn tile small class="button pa-0 px-2" v-on="{ ...on_hover, ...on_click }" :disabled=disabled>
            {{ name }}
          </v-btn>
        </template>

        <span>{{ path }}</span>

      </v-tooltip>
    </template>

    <v-list dense>
      <v-list-item
        v-for="(item, index) in menu"
        :key="index" dense
        @click.stop="$emit('menu', item.key)"
      >
        <v-list-item-title>{{ item.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ item.text }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>

  </v-menu>
</template>

<style scoped>
.button {
  height: 18px !important;
}
</style>

<script>
export default {
  props: {
    name: { type: String, default: '' },
    path: { type: String, default: '' },
    menu: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false }
  }
}
</script>
