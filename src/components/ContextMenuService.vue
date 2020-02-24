<template>
  <div>
    <v-menu
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      :position-x="position_x"
      :position-y="position_y"
    >
      <v-list>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          @click="item.action"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

  </div>
</template>

<style>
</style>

<script>
  import { remote } from 'electron';

  export default {
    props: {
      value: { type: Boolean, default: false },
      items: { type: Array },
      position_x: { type: Number, default: 0 },
      position_y: { type: Number, default: 0 },

    },

  }

</script>

