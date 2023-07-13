<template>
  <div class="question">
    <header class="question-header">
      <h2 class="header-title">{{ infoHeader.title }}</h2>
    </header>
    <section class="question-section">
      <!-- 前言 -->
      <div class="question-content" v-if="infoHeader.content" v-html="infoHeader.content"></div>
      <a-skeleton active :paragraph="{ rows: 16 }" :loading="questionData.length === 0">
        <a-form layout="vertical" class="question-list" :model="formState" ref="formRef">
          <template v-for="item in questionData" :key="item.id">
            <div class="question-item">
              <div v-if="item.type === '段落说明'" v-html="item.title"></div>
              <a-form-item v-else :label="item.title" :name="item.id" :required="item.must" :rules="item.must ? [{ required: true, message: '请完成该评价' }] : []">
                <a-radio-group v-if="item.type === '单选'" class="grid" :style="generateColumn(item.column)" v-model:value="formState[item.id]">
                  <a-radio class="flex item-option" v-for="subItem in item.option" :key="subItem.id" :value="subItem.id" :name="subItem.content">{{ subItem.content }}</a-radio>
                </a-radio-group>
                <a-checkbox-group v-else-if="item.type === '多选'" class="grid" :style="generateColumn(item.column)" v-model:value="formState[item.id]">
                  <a-checkbox class="flex item-option" v-for="subItem in item.option" :key="subItem.id" :value="subItem.id" :name="subItem.content">{{ subItem.content }}</a-checkbox>
                </a-checkbox-group>
                <a-input v-else-if="item.type === '填空'" v-model:value="formState[item.id]"></a-input>
              </a-form-item>
            </div>
          </template>
        </a-form>
        <a-button type="primary" block size="large" @click="submitTo">提交</a-button>
      </a-skeleton>
    </section>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import shortId from "shortid";
import type { FormInstance } from "ant-design-vue/es/form";
import type { questionType, answerType, surveyAnswerType } from "@/types/index";
import { surveyStore } from "@/stores/survey";
import { getTime, timeDiff } from "@/utils/index";
import { answerSave, answerSelected } from "@/computed/answer";

const props = defineProps({
  preview: {
    type: Boolean,
    default: false
  },
})

const router = useRouter();
const storeData = surveyStore();
const infoHeader = reactive({
  title: "",
  content: "",
  id: "",
});
const questionData = ref<questionType[]>([]);
const formState = ref<Record<string, any>>({});
const formRef = ref<FormInstance | null>(null);
const startTime = ref<string>("");

onMounted(() => {
  let surveyId: any = router.currentRoute.value.query?.id;
  let answerId: any = router.currentRoute.value.query?.answerId;
  if (surveyId) {
    let survey = storeData.surveySelected(surveyId);
    if (!survey) {
      return message.error("问卷不存在或问卷已删除");
    } else if (!survey.state && !props.preview) {
      return message.error("当前问卷已暂停，请稍后重试！");
    }
    infoHeader.title = survey.title;
    infoHeader.content = survey.content;
    infoHeader.id = survey.id;
    questionData.value = survey.question;
    startTime.value = getTime();
    if (answerId) {
      let answer = answerSelected(surveyId, answerId);
      if (!answer) return message.error("未找到相关答案");
      let state: any = {}
      for (let i in answer.answer) {
        state[answer.answer[i].questionId] = answer.answer[i].content
      }
      formState.value = state
      console.log('打印formState.value', formState.value)
    }
  } else {
    message.error("没有获取到调查");
  }
});

function generateColumn(column: number) {
  return { 'grid-template-columns': `repeat(${column}, minmax(0, 1fr))` };
}

//提交数据
const submitTo = () => {
  formRef.value?.validate().then(() => {
    console.log("打印获取数据", formState.value);
    if (props.preview) return message.error("此问卷为预览状态，不能提交！");
    let answerData: answerType[] = [];
    let formData = formState.value;
    for (let i in formData) {
      answerData.push({ questionId: Number(i), content: formData[i] });
    }
    let endTime = getTime()
    let surveyAnswerData: surveyAnswerType = {
      answerId: "answer-" + shortId.generate(),
      surveyId: infoHeader.id,
      surveyTitle: infoHeader.title,
      startTime: startTime.value,
      endTime: endTime,
      consumTime: timeDiff(startTime.value, endTime),
      answer: answerData,
    };

    answerSave(surveyAnswerData)
    console.log("打印surveyAnswerData", surveyAnswerData);
    router.replace("/question/success");
  });
};
</script>
<style lang='scss' scoped>
.question {
  max-width: 1200px;
  margin: 0 auto;
}

.question-header {
  padding: 10px;
  background: #2071e2;
}

.question-section {
  padding: 10px;
}

.header-title {
  text-align: center;
  color: #fff;
  font-weight: 700;
}

.question-content {
  margin-bottom: 10px;
}

.question-item {
  padding: 10px;
  background: #fff;
  border-radius: 5px;
  margin-bottom: 10px;
  font-size: 16px;

  :deep(.ant-form-item-required) {
    font-size: 16px !important;
  }

  .ant-form-item {
    margin-bottom: 0;
  }

  .grid .ant-checkbox-group,
  .grid .ant-radio-group {
    width: 100%;
  }

  .item-option {
    width: 100%;
    margin: 0;
    line-height: 40px;
    font-size: 16px;
    padding: 0 10px;

    &:hover {
      background: #f9f9f9;
    }
  }
}
</style>
