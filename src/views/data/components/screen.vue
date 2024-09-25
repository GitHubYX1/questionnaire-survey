<template>
  <div class="screen">
    <div class="screen-head" @click="screenShow = !screenShow">
      <PartitionOutlined /> 数据筛选
    </div>
    <div class="screen-box" v-show="screenShow">
      <div class="screen-arrow"><i></i></div>
      <div class="screen-label">题目筛选：</div>
      <div class="screen-subject">
        <div class="screen-condition">
          <a-radio-group v-model:value="conditionValue" button-style="solid">
            <a-radio-button value="and">且</a-radio-button>
            <a-radio-button value="or">或</a-radio-button>
          </a-radio-group>
          <a-button @click="addCondition">添加条件</a-button>
        </div>
        <div v-for="(item, index) in screenData" :key="item.id" class="screen-item flex align-items ">
          <a-select placeholder="请选择" class="screen-select" :fieldNames="{ label: 'title', value: 'id' }"
            v-model:value="item.value" show-search :options="screenQuestion" @select="select(index, $event)"
            :filter-option="filterQuestion" />
          <a-select placeholder="请选择" class="screen-select" :fieldNames="{ label: 'content', value: 'id' }"
            v-if="item.option.length" v-model:value="item.answer" mode="multiple" max-tag-count="responsive"
            :options="item.option" :filter-option="filterOption"></a-select>
          <a-button type="primary" danger @click="removeCondition(index)">删除</a-button>
        </div>
      </div>
      <div class="screen-label">提交时间：</div>
      <div class="screen-item flex align-items">
        <div class="screen-content">
          <a-range-picker v-model:value="date" />
        </div>
      </div>
      <div class="screen-item flex align-items">
        <div class="screen-content">
          <a-button style="margin-right: 20px;" @click="reset">重置</a-button>
          <a-button type="primary" @click="screenClick">查询</a-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { message } from "ant-design-vue";
import type { questionType, optionType, answerType } from "@/types/index";
import { surveyStore } from "@/stores/survey";
import { typeEnum } from "@/assets/common/enums";

interface screenType {
  value: string;
  id: number;
  option: optionType[];
  answer: number[];
}

const { PAGING, PARAGRAPH, FILL, SLIDER, MATRIX_SLIDER } = typeEnum;
const noConcernItem = [PAGING, PARAGRAPH, FILL, SLIDER, MATRIX_SLIDER];

const storeData = surveyStore();

const dateFormat = "YYYY-MM-DD";
const emit = defineEmits(["screenData"]);
const screenShow = ref(false);
const date = ref<[Dayjs, Dayjs]>();
const screenQuestion = ref<questionType[]>([]);
const conditionValue = ref("and");
const screenData = ref<screenType[]>([]);

const filterQuestion = (input: string, option: questionType) => {
  return option.title.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};

const filterOption = (input: string, option: optionType) => {
  return option.content.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};

//增加条件
const addCondition = () => {
  if (screenData.value.length == screenQuestion.value.length) return message.info("已超过可关联题目数量！");
  screenData.value.push({
    value: "",
    id: screenData.value.length + 1,
    option: [],
    answer: [],
  });
}

// 删除条件
const removeCondition = (index: number) => {
  screenData.value.splice(index, 1);
}

//选择数据
const select = (index: number, value: number) => {
  if (screenData.value[index].id === value) return;
  let ids = screenData.value.map((item: any) => item.id).indexOf(value);
  if (ids !== -1) {
    screenData.value[index].value = screenQuestion.value.find((item: any) => item.id == screenData.value[index].id)?.title || "";
    return message.info("关联题目不能重复");
  }
  let data = screenQuestion.value.find((item) => item.id == value);
  screenData.value[index].value = data?.title || "";
  screenData.value[index].id = value;
  screenData.value[index].option = data?.option || [];
};

watch(
  () => storeData.surveyId,
  async (id: string) => {
    const survey = storeData.surveySelected(id);
    const questionList: questionType[] = [];
    for (const item of survey.question) {
      if (!noConcernItem.includes(item.type)) {
        if (item.children && item.children.length) {
          for (const child of item.children) {
            child.title = item.title + "-" + child.title;
            questionList.push(child);
          }
        } else {
          questionList.push(item);
        }
      }
    }
    screenQuestion.value = questionList;
    screenData.value = [];
    conditionValue.value = "and";
    screenShow.value = false;
  },
  { immediate: true }
)

//重置
const reset = () => {
  date.value = undefined;
  screenData.value = [];
  conditionValue.value = "and";
}

// 提交数据
const screenClick = () => {
  const dateInfo = ["", ""];
  screenData.value = screenData.value.filter(item => item.answer.length > 0);
  const answer: answerType[] = screenData.value.map(item => ({ questionId: item.id, content: item.answer }));
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
  emit("screenData", { date: dateInfo, condition: conditionValue.value, answer })
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

    >i {
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

  .screen-subject {
    width: 710px;
    border: 1px solid #dddddd;
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0;

    .ant-radio-group {
      border: 1px solid #d9d9d9;
      border-radius: 5px;
      overflow: hidden;
    }

    :deep(.ant-radio-button-wrapper) {
      border: none;
    }

    .screen-condition {
      display: flex;
      justify-content: space-between;
    }

    .screen-select {
      width: 300px;
      margin-right: 10px;
    }
  }

  .screen-item {
    margin-top: 10px;
  }
}
</style>
