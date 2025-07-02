<template>
  <ul>
    <li v-for="p in list" :key="p.id">{{ p.name }}-{{ p.age }}</li>
  </ul>
</template>

<script lang="ts" name="Person" setup>
import { withDefaults } from 'vue'
import { type Persons } from '@/index'
withDefaults(defineProps<{ list?: Persons }>(), {
  list: () => [
    {
      id: 'r',
      name: '但是',
      age: 12,
    },
  ],
})
</script>

<style scoped>
.app {
  background-color: antiquewhite;
  box-shadow: 0 0 10px;
  border: 3px rebeccapurple solid;
}
</style>
