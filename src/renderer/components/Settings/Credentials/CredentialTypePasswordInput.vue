<template>
  <div>
    <text-input
      label="username"
      index="username"
    />
    <text-input
      label="password"
      index="password"
      obscureable
    />
  </div>
</template>

<script setup lang="ts">
import TextInput from '@/components/Settings/TextInput.vue'
</script>
