<template>
  <a-modal :visible="batchVisible" title="选项批量添加" width="500px" @cancel="batchCancel" @ok="batchOk">
    <div class="batch-box">
      <a-textarea v-model:value="optionText" allow-clear />
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { Modal } from "ant-design-vue";
import { questionnaireStore } from "@/stores/questionnaire";

const questionnaire = questionnaireStore();
const batchVisible = ref(false);
const optionText = ref("");
const indexNum = ref(0);

// 打开
const batchOpen = (index: number, text: string) => {
  batchVisible.value = true;
  optionText.value = text;
  indexNum.value = index;
};

const batchCancel = (e: any) => {
  if (e.target.className != "ant-modal-wrap") batchVisible.value = false;
};
const batchOk = () => {
  if (optionText.value.replace(/\s*/g, "") == "") {
    return Modal.warning({
      title: "提示",
      content: "添加内容必填",
    });
  }
  const id = questionnaire.question[indexNum.value].id;
  const controlLogic = questionnaire.controlLogic.filter((item) => item.questionIds.includes(String(id)));
  const controlOption = questionnaire.controlOption.filter((item) => item.childId === id || item.questionIds.includes(String(id)));
  //判断是否有逻辑关联
  if (controlLogic.length || controlOption.length) {
    Modal.confirm({
      title: "提示",
      content: `原有选项有关联控制逻辑，确认批量添加并同时删除原来的控制逻辑？`,
      okText: "确认",
      cancelText: "取消",
      onOk() {
        questionnaire.optionBatchAdd({ index: indexNum.value, optionText: optionText.value });
        batchVisible.value = false;
      },
    });
  } else {
    questionnaire.optionBatchAdd({ index: indexNum.value, optionText: optionText.value });
    batchVisible.value = false;
  }
};

defineExpose({ batchOpen });
</script>
<style lang="scss" scoped>
.batch-box {
  .ant-input-affix-wrapper {
    height: 200px;
  }
}
</style>
