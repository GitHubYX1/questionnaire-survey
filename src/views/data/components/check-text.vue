<template>
  <a-modal :visible="checkShow" :title="titleData" width="50%" @cancel="onCancel" :footer="false">
    <a-table :dataSource="checkData" bordered rowKey="xh" :pagination="checkData.length < 10 ? false : true">
      <a-table-column key="xh" title="序号" dataIndex="xh" align="center" width="100px"></a-table-column>
      <a-table-column key="xh" title="答案文本" dataIndex="count" align="center"></a-table-column>
    </a-table>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { fillType } from "@/types/index";

const checkShow = ref(false);
const titleData = ref("");
const checkData = ref<fillType[]>([]);

// 打开
const open = (title: string, fill: fillType[]) => {
  console.log("fill",fill);
  titleData.value = title;
  checkData.value = fill;
  checkShow.value = true;
};

//取消
const onCancel = (e: any) => {
  if (e.target.className != "ant-modal-wrap") checkShow.value = false;
};


defineExpose({ open })
</script>
<style lang="scss" scoped></style>
