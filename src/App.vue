<template>
  <a-config-provider :locale="locale"><RouterView /></a-config-provider>
</template>

<script lang="ts" setup>
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { RouterView } from "vue-router";
dayjs.locale("zh-cn");
let locale = zhCN;
</script>

<style scoped>
</style>
