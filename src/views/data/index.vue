<template>
  <a-layout>
    <a-layout-header>
      <data-header></data-header>
    </a-layout-header>
    <a-layout-content>
      <div class="data-content"><router-view /></div>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import dataHeader from "./components/data-header.vue";
</script>

<style lang="scss" scoped>
.ant-layout-content{
  overflow-y: auto;
}

.data-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 0;
}
</style>