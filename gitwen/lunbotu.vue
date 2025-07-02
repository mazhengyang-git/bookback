<template>
  <div class="se">
    <div class="gitju"><div class="gitz"></div></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from 'vue'
//vue与git到此一游
</script>
<style>
.se {
  background-color: rgb(157, 169, 176);
  width: 100%;
  height: 500px;
}
.gitju {
  position: relative;
}
.gitz {
  position: absolute;
  justify-content: center;
  text-align: center;
  top: 100px;
}
</style>
