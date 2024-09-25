<template>
  <a-modal :visible="copyVisible" title="复制向前关联" width="800px" :mask="false" @cancel="onCancel" @ok="handleOk">
    <div class="copy-box">
      <a-table :rowSelection="{ selectedRowKeys: childIds, onChange: onSelectChange }" :customRow="customRow" :scroll="{ y: 500 }" :dataSource="tableData" :pagination="false" bordered rowKey="id">
        <a-table-column key="id" title="题目标题" align="center">
          <template #default="{ record }">
            <div v-html="record.title"></div>
          </template>
        </a-table-column>
      </a-table>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { message } from "ant-design-vue";
import type { questionType, controlLogicType } from "@/types/index";

const copyVisible = ref(false);
const tableData = ref<questionType[]>([]);
const childIds = ref<number[]>([]);
const ids = ref<number>(0);
const titleText = ref("");
const emit = defineEmits(["getCopy"]);
const controlLogicData = ref<controlLogicType | null>(null);

const copyOpen = (data: questionType[], title: string, id: number, controlLogic: controlLogicType) => {
  if (data.length === 0) return message.info("此题后面没有选项，无法复制！");
  copyVisible.value = true;
  tableData.value = data.concat().map(item=>{
    delete item.children
    return item
  });
  childIds.value = [];
  titleText.value = title;
  ids.value = id;
  controlLogicData.value = controlLogic;
};

const onSelectChange = (sel: number[]) => {
  childIds.value = sel;
};

//点击行
const customRow = (record: questionType) => {
  return {
    onClick: () => {
      if (!childIds.value.includes(record.id)) {
        childIds.value.push(record.id);
      } else {
        childIds.value = childIds.value.filter((item) => item !== record.id);
      }
    },
  };
};

//取消
const onCancel = (e: any) => {
  if (e.target.className != "ant-modal-wrap") copyVisible.value = false;
};

const handleOk = () => {
  copyVisible.value = false;
  if (childIds.value.length && controlLogicData.value) {
    let data: controlLogicType[] = [];
    for (let i in childIds.value) {
      data.push({ ...controlLogicData.value, childId: childIds.value[i] });
    }
    emit("getCopy", { id: ids.value, childId: childIds.value, data });
  }
};

defineExpose({ copyOpen });
</script>
<style lang="scss" scoped>
:deep(.ant-table-cell) {
  cursor: pointer;
}
</style>
