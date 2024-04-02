<template>
  <div class="screen">
    <div class="screen-head" @click="screenShow = !screenShow"><PartitionOutlined /> 条件筛选</div>
    <div class="screen-box" v-show="screenShow">
      <div class="screen-arrow"><i></i></div>
      <div class="screen-item flex align-items">
        <div class="screen-label">提交时间：</div>
        <div class="screen-content">
          <a-range-picker v-model:value="date" />
        </div>
      </div>
      <div class="screen-item flex align-items">
        <div class="screen-label">查询筛选：</div>
        <div class="screen-content">
          <a-button type="primary" @click="screenClick">查询数据</a-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

const dateFormat = "YYYY-MM-DD";
const emit = defineEmits(["screenData"]);
const screenShow = ref(false);
const date = ref<[Dayjs, Dayjs]>();

const screenClick = () => {
  const dateInfo = ["", ""];
  if (date.value) {
    const time = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss").split(" ");
    const dateData = [date.value[0].format(dateFormat), date.value[1].format(dateFormat)];
    let end = "23:59:59";
    dateInfo[0] = dateData[0] + " 00:00:00";
    if (time[0] == dateData[1]) {
      end = time[1];
    }
    dateInfo[1] = dateData[1] + " " + end;
  }
  emit('screenData', { date: dateInfo })
};
</script>
<style lang="scss" scoped>
.screen {
  font-size: 16px;

  .screen-head {
    cursor: pointer;
  }
}

.screen-box {
  background: #f0f2f5;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 10px;
  margin-top: 10px;
  position: relative;

  .screen-arrow {
    position: absolute;
    top: -5px;
    left: 40px;
    width: 10px;
    height: 6px;
    overflow: hidden;

    > i {
      display: block;
      width: 10px;
      height: 10px;
      margin-top: 1px;
      border: 1px solid #e0e0e0;
      background: #f0f2f5;
      -webkit-transform: rotate(45deg);
      -moz-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      -o-transform: rotate(45deg);
      transform: rotate(45deg);
    }
  }

  .screen-item {
    margin-bottom: 10px;
    .screen-label {
      width: 100px;
      text-align: right;
      margin-right: 10px;
    }
  }
}
</style>
