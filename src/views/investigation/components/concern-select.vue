<template>
  <div class="concern-select">
    <a-form layout="vertical" class="front-list" :model="formFront" ref="formFrontRef">
      <div class="front-item" v-for="(item, index) in concernData" :key="index">
        <div class="front-title flex align-items">
          <div class="front-text">关联题目<span v-if="concernData.length > 1">{{ index + 1 }}</span> :</div>
          <div class="front-search flex-between align-items">
            <a-select
              v-model:value="item.value"
              show-search
              :options="options"
              :fieldNames="{ label: 'title', value: 'id' }"
              @select="select(index, $event)"
              style="width: 90%"
              :filter-option="filterOption"
            />
            <template v-if="showAdd">
              <span v-if="index == 0" @click="frontAdd">+更多</span>
              <span v-else @click="frontCancel(index, item.id)">-取消</span>
            </template>
          </div>
        </div>
        <div class="front-option" v-if="item.option.length">
          <div class="front-tip">
            <p>当“关联题目{{ index + 1 }}”选择下面的选项：</p>
            <a-button size="small" @click="invert(index, item.id)">反选</a-button>
          </div>
          <a-form-item>
            <a-checkbox-group v-model:value="formFront[item.id]">
              <a-checkbox class="flex front-checkbox" v-for="subItem in item.option" :key="subItem.id" :value="Number(subItem.id)" :name="subItem.content">{{ subItem.content }}</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
        </div>
      </div>
    </a-form>
    <div class="front-radio" v-if="concernData.length > 1">
      <div class="front-title flex">
        <div class="front-text">关联多题时：</div>
        <span>多题（每个矩阵行标题视为一题）间</span>
      </div>
      <div class="front-option">
        <a-radio-group v-model:value="conditionValue" name="radioGroup">
          <a-radio value="and"> 为“且”的关系</a-radio>
          <a-radio value="or"> 为“或”的关系</a-radio>
        </a-radio-group>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, type PropType } from "vue";
import { message } from "ant-design-vue";
import type { optionType, questionType, controlLogicType } from "@/types/index";

interface selectType {
  value: number;
  label: string;
}

interface concernType {
  value: string;
  id: number;
  option: optionType[];
}

const props = defineProps({
  childId: {
    type: Number,
    default: 0,
  },
  options: {
    type: Array as PropType<questionType[]>,
    default: [],
  },
  control: {
    type: Object as PropType<controlLogicType | null>,
    default: () => null,
  },
  showAdd: {
    type: Boolean,
    default: true,
  },
  optionId: {
    type: Number,
    default: undefined,
  },
});

const concernData = ref<concernType[]>([
  {
    value: "",
    id: 0,
    option: [],
  },
]);
const formFront = ref<Record<number, number[]>>({});
const conditionValue = ref<"and" | "or">("and");

watch(
  () => props.childId,
  () => {
    if (props.control) {
      conditionValue.value = props.control.condition;
      let questionIds = props.control.questionIds.split(",").map((item) => Number(item));
      let parentAnswer = props.control.parentAnswer.split("|").map((item: string) => item.split(",").map((id) => Number(id)));
      let option: Record<string, number[]> = {};
      let concernList: concernType[] = props.options.flatMap((item) => (questionIds.indexOf(item.id) !== -1 ? { value: item.title, id: item.id, option: item.option } : []));
      for (let i in questionIds) {
        option[questionIds[i]] = parentAnswer[i];
      }
      concernData.value = concernList;
      formFront.value = option;
    }
  },
  { immediate: true }
);

const filterOption = (input: string, option: selectType) => {
  return option.label.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};

//反选
const invert = (index: number, id: number) => {
  let option = concernData.value[index].option;
  let front = formFront.value[id];
  if (!front || front.length == 0) {
    formFront.value[id] = option.map((item) => item.id);
  } else {
    formFront.value[id] = option.filter((item) => front.indexOf(item.id) === -1).map((item) => item.id);
  }
};
//新增
const frontAdd = () => {
  if (concernData.value.length == props.options.length) return message.info("已超过可关联题目数量！");
  concernData.value.push({
    value: "",
    id: concernData.value.length + 1,
    option: [],
  });
};
//取消
const frontCancel = (index: number, id: number) => {
  concernData.value.splice(index, 1);
  delete formFront.value[id];
};

//选择数据
const select = (index: number, value: number) => {
  console.log("value", index, value);
  if (concernData.value[index].id === value) return;
  let ids = concernData.value.map((item) => item.id).indexOf(value);
  if (ids !== -1) {
    concernData.value[index].value = props.options.find((item) => item.id == concernData.value[index].id)?.title || "";
    return message.info("关联题目不能重复");
  }
  let data = props.options.find((item) => item.id == value);
  const id = concernData.value[index].id;
  delete formFront.value[id];
  concernData.value[index].value = data?.title||"";
  concernData.value[index].id = value;
  concernData.value[index].option = data?.option || [];
};

//确定
const getConcern = () => {
  let ids: string[] = [];
  let parentAnswer = [];
  let from = formFront.value;
  console.log("from",from);
  
  for (let i in from) {
    if (from[i].length) {
      ids.push(i);
      parentAnswer.push(from[i].join(","));
    }
  }
  const controlLogic: controlLogicType = {
    questionIds: ids.join(),
    childId: props.childId,
    parentAnswer: parentAnswer.join("|"),
    condition: conditionValue.value,
  };
  if (props.optionId !== undefined) controlLogic.optionId = props.optionId;
  return controlLogic;
};

defineExpose({ getConcern });
</script>
<style lang="scss" scoped>
.front-list {
  margin-top: 15px;

  .front-item {
    margin-bottom: 15px;
  }
}

.front-text {
  width: 100px;
  font-size: 16px;
}

.front-search {
  width: calc(100% - 100px);

  > span {
    color: #999999;
    margin-left: 20px;
    cursor: pointer;

    &:hover {
      color: #333333;
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
