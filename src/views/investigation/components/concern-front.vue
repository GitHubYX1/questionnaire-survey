<template>
  <a-modal :visible="frontVisible" title="题目向前关联" width="800px" :mask="false" @cancel="onCancel" @ok="handleOk">
    <div class="front-box">
      <div class="front-title flex">
        <div class="front-text">当前题目：</div> {{ titleText }}
      </div>
      <concern-select v-if="frontVisible" :options="questions" :childId="childId" :control="control" ref="concernRef"></concern-select>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { message } from "ant-design-vue";
import concernSelect from "./concern-select.vue";
import type { optionType, questionType, controlLogicType } from "@/types/index";

interface selectType {
  value: number;
  label: string;
}

interface concernType {
  value: string;
  id: number;
  option: optionType[]
}

const frontVisible = ref(false);
const questions = ref<questionType[]>([]);
const titleText = ref('')
const options = ref<selectType[]>([])
const childId = ref<number>(0)
const control = ref<controlLogicType | undefined>();
const concernRef = ref<any>(null);

const emit = defineEmits(['getFront'])


// 打开
const frontOpen = (data: questionType[], title: string, id: number, controlLogic: controlLogicType | undefined) => {
  if (data.length === 0) return message.info("此题前面没有选项题，无法设置关联逻辑！");
  frontVisible.value = true;
  questions.value = data;
  titleText.value = title;
  childId.value = id;
  options.value = data.map(item => { return { value: item.id, label: item.title } });
  control.value = controlLogic;
}
//取消
const onCancel = (e: any) => {
  if (e.target.className != "ant-modal-wrap") frontVisible.value = false;
};

//确定
const handleOk = () => {
  const concern = concernRef.value.getConcern();
  emit("getFront", concern)
  frontVisible.value = false
}

defineExpose({ frontOpen })
</script>
<style lang="scss" scoped>
.front-box {
  font-size: 16px;
  max-height: 400px;
  overflow-y: auto;

  .front-text {
    width: 100px;
    font-size: 16px;
  }

  .front-tip {
    font-size: 16px;

    p {
      padding: 6px 0;
      margin: 0;
    }
  }

  .front-list {
    margin-top: 15px;

    .front-item {
      margin-bottom: 15px;
    }
  }

  .front-search {
    width: calc(100% - 100px);

    >span {
      color: #999999;
      margin-left: 20px;
      cursor: pointer;

      &:hover {
        color: #333333;
      }
    }
  }
}

.ant-checkbox-group {
  width: 100%;
}

.front-option {
  margin-left: 100px;

  .front-checkbox {
    width: 100%;
    margin: 0;
    font-size: 16px;
    padding: 0 10px;

    &:hover {
      background: #f9f9f9;
    }
  }
}
</style>