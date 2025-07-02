<template>
  <div>
    <RouterView />
  </div>
</template>

<script lang="ts" setup>
import home from '../components/home.vue'
import mbh480 from '../coma/mbh480.vue'
import { ref, provide, inject } from 'vue'
let zuox = ref(false)
provide('zuox', zuox)
</script>

<style></style>
