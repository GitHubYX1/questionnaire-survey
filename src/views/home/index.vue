<template>
  <a-layout>
    <a-layout-header>
      <div class="header-box">问卷调查系统</div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider>
        <survey-menu></survey-menu>
      </a-layout-sider>
      <a-layout-content><router-view /></a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import SurveyMenu from "./components/survey-menu.vue"
import { ref } from "vue";
let value1 = ref("");
</script>
<style lang="scss" scoped>
.ant-layout {
  height: 100%;
}

.ant-layout-header {
  background: #fff;
  border-bottom: 1px solid #efefef;
}
.ant-layout-sider{
  background: #fff;
  border-right: 1px solid #efefef;
}

.header-box{
  font-size: 28px;
  font-weight: 700;
}

.ant-layout-content{
  overflow-y: auto;
  background: #f9f9f9;
}
</style>
