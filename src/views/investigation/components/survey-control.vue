<template>
  <div class="control-nav">
    <p class="control-title">控件栏</p>
    <div class="control-list flex-between flex-wrap">
      <div class="control-item" v-for="item in contrlData" :key="item.id" @click="clickControl(item)">
        <component :is="item.icon"></component>
        {{ item.title }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type contrlType } from "@/types/index";
import { contrlList } from "@/assets/common/local-data";

const contrlData: contrlType[] = contrlList;
const emit = defineEmits(["deriveContrl"]);

const clickControl = (contrl: contrlType) => {
  emit("deriveContrl", { title: contrl.title, type: contrl.type });
};
</script>
<style lang="scss" scoped>
.control-title {
  font-size: 16px;
  margin-bottom: 10px;
}

.control-item {
  width: 45%;
  padding: 5px;
  text-align: center;
  border: 1px solid #e4e4e4;
  border-radius: 5px;
  margin-bottom: 10px;
  cursor: pointer;

  &:hover {
    border: 1px solid #1890ff;
    color: #1890ff;
  }
}
</style>
