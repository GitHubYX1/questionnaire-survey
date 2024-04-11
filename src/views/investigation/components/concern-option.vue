<template>
  <a-modal :visible="optionVisible" title="选项关联" width="800px" :mask="false" @cancel="onCancel" @ok="handleOk">
    <div class="option-box">
      <p class="option-title">{{ titleText }}</p>
      <a-table :dataSource="optionData" :pagination="false" bordered rowKey="id">
        <a-table-column key="content" dataIndex="content" width="20%" title="当前选项" align="center"></a-table-column>
        <a-table-column key="id" title="选项出现条件" width="80%" align="center">
          <template #default="{ record, index }">
            <div class="option-condition align-items flex-between" v-if="controlId !== record.id">
              <div class="option-control">{{ logicText(record.control) }}</div>
              <a-button type="link" size="large" @click="controlSet(record.id)">{{ record.control ? "修改" : "添加关联" }}</a-button>
            </div>
            <div class="option-condition" v-else>
              <concern-select :options="questions" :childId="questionId" :optionId="record.id" :control="record.control" :showAdd="false" ref="concernRef"></concern-select>
              <div class="option-button">
                <a-button type="primary" size="small" @click="determineConcern(index)">确定</a-button>
                <a-button type="primary" size="small" danger style="margin-left: 10px" @click="deleteConcern(index)">删除关联</a-button>
              </div>
            </div>
          </template>
        </a-table-column>
      </a-table>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
import { ref, type PropType } from "vue";
import type { optionType, questionType, controlOptionType, controlLogicType } from "@/types/index";
import concernSelect from "./concern-select.vue";

interface optionControlType extends optionType {
  control?: controlLogicType;
}

const props = defineProps({
  logicText: {
    type: Object as PropType<(controlLogic: controlLogicType | undefined) => string>,
    default: () => {},
  },
});

const emit = defineEmits(["optionChange"]);

const questions = ref<questionType[]>([]);
const optionVisible = ref(false);
const titleText = ref("");
const optionData = ref<optionControlType[]>([]);
const controlId = ref<number | null>(null);
const concernRef = ref<any>(null);
const questionId = ref<number>(0);

// 打开
const optionOpen = (data: questionType[], title: string, option: optionType[], id: number, controlOption: controlLogicType[]) => {
  console.log(data, title, option);
  titleText.value = title;
  optionVisible.value = true;
  optionData.value = option;
  questions.value = data;
  questionId.value = id;
  console.log("controlOption", controlOption);
  if (controlOption.length) {
    optionData.value.forEach((item) => {
      for (const element of controlOption) {
        if (item.id === element.optionId) {
          return (item.control = element);
        }
      }
    });
  }
};

//取消
const onCancel = (e: any) => {
  if (e.target.className != "ant-modal-wrap") {
    controlId.value = null;
    optionVisible.value = false;
  }
};

//确定
const handleOk = () => {
  const control = optionData.value.flatMap((item) => {
    return item.control ? item.control : [];
  });
  const optionLogic: controlOptionType = {
    questionId: questionId.value,
    control: control,
  };
  controlId.value = null;
  optionVisible.value = false;
  emit("optionChange", optionLogic);
};

//关联设置
const controlSet = (id: number) => {
  controlId.value = id;
};

//确定关联
const determineConcern = (index: number) => {
  const concern = concernRef.value.getConcern();
  if (concern.parentAnswer) {
    optionData.value[index].control = concern;
  } else {
    optionData.value[index].control = undefined;
  }
  controlId.value = null;
};
//删除关联
const deleteConcern = (index: number) => {
  optionData.value[index].control = undefined;
  controlId.value = null;
};

defineExpose({ optionOpen });
</script>

<style lang="scss" scoped>
.option-box {
  font-size: 16px;
  max-height: 400px;
  overflow-y: auto;
  .option-condition {
    text-align: left;
    .option-control {
      width: 480px;
    }
  }
}

.option-button{
  margin-left: 100px;
}
</style>
