<template>
  <div class="question">
    <header class="question-header">
      <h2 class="header-title">{{ infoHeader.title }}</h2>
    </header>
    <section class="question-section">
      <!-- 前言 -->
      <div class="question-content" v-if="infoHeader.content && pageIndex === 0" v-html="infoHeader.content"></div>
      <a-skeleton active :paragraph="{ rows: 16 }" :loading="questionData.length === 0">
        <a-form layout="vertical" class="question-list" :model="formState" ref="formRef">
          <template v-for="item in questionData[pageIndex]" :key="item.id">
            <transition name="slide-x" mode="out-in">
              <div class="question-item" :id="'item-' + item.id" v-if="isShow(item.id)">
                <div v-if="item.type === '段落说明'" v-html="item.title"></div>
                <a-form-item v-else :label="item.title" :key="item.id" :name="item.id"
                  :rules="item.must ? [{ required: true, message: '请完成该评价' }] : []">
                  <a-radio-group v-if="item.type === '单选'" class="grid" :style="generateColumn(item.column)"
                    v-model:value="formState[item.id]">
                    <a-radio class="flex item-option" v-for="subItem in item.option" :key="subItem.id" :value="subItem.id"
                      :name="subItem.content">{{ subItem.content.replace(/\\n/g, '\n') }}</a-radio>
                  </a-radio-group>
                  <a-checkbox-group v-else-if="item.type === '多选'" class="grid" :style="generateColumn(item.column)"
                    v-model:value="formState[item.id]">
                    <a-checkbox class="flex item-option" v-for="subItem in item.option" :key="subItem.id"
                      :value="subItem.id" :name="subItem.content">{{ subItem.content.replace(/\\n/g, '\n') }}</a-checkbox>
                  </a-checkbox-group>
                  <a-select v-else-if="item.type === '下拉'" class="drop-down" placeholder="请选择下拉列表"
                    v-model:value="formState[item.id]" :options="item.option"
                    :fieldNames="{ label: 'content', value: 'id' }"></a-select>
                  <a-rate v-else-if="item.type === '评分'" v-model:value="formState[item.id]" style="font-size: 28px"
                    :count="item.option.length" />
                  <template v-else-if="item.type === '填空'">
                    <a-input v-if="item.column === 1" v-model:value="formState[item.id]"></a-input>
                    <a-textarea v-else :rows="item.column" v-model:value="formState[item.id]" />
                  </template>
                </a-form-item>
              </div>
            </transition>
          </template>
        </a-form>
        <a-button v-if="pageIndex !== 0" block size="large" @click="prevPage">上一页</a-button>
        <a-button v-if="pageIndex === questionData.length - 1" type="primary" block size="large"
          @click="submitTo(true)">提交</a-button>
        <a-button v-else type="primary" block size="large" @click="submitTo(false)">下一页</a-button>
      </a-skeleton>
    </section>
  </div>
</template>

<script lang='ts' setup>
import { ref, unref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import shortId from "shortid";
import type { FormInstance } from "ant-design-vue/es/form";
import type { questionType, answerType, surveyAnswerType, QuestionControlType } from "@/types/index";
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
const questionData = ref<questionType[][]>([]);
const formState = ref<Record<string, any>>({});
const formRef = ref<FormInstance | null>(null);
const startTime = ref<string>("");
const controlData = ref<QuestionControlType[]>([]);
const questionItem = document.getElementsByClassName("question-item");//获取题目元素
const pageIndex = ref(0);
const answerIdRef = ref("");

//获取题目
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

    const questionLsit: questionType[][] = [[]];
    let page = 0;
    survey.question.forEach(item => {
      if (item.type !== '分页') {
        questionLsit[page].push(item);
      } else {
        page++;
        questionLsit.push([]);
      }
    })
    questionData.value = questionLsit.filter(item => item.length !== 0);
    console.log("questionLsit", questionLsit);
    //获取逻辑
    controlData.value = survey.controlLogic.map(item => ({
      id: item.childId,
      parentIds: item.questionIds.split(',').map((item: string) => Number(item)),
      condition: item.condition,
      parentAnswer: item.parentAnswer.split('|').map((item: string) =>
        item.split(',').map((id) => Number(id)),
      ),
    }))
    startTime.value = getTime();
    //判断是否有有答案
    if (answerId) {
      answerIdRef.value = answerId;
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
//获取列数
function generateColumn(column: number) {
  return { 'grid-template-columns': `repeat(${column}, minmax(0, 1fr))` };
}
//是否显示题目
const isShow = (id: number) => {
  const findControl = unref(controlData).find((item) => item.id === id);
  if (findControl) {
    const form = unref(formState);
    let logicList: boolean[] = [];
    findControl.parentIds.forEach((parentId, index) => {
      const answer = findControl.parentAnswer[index];
      logicList.push(
        answer.some(item => {
          return Array.isArray(form[parentId]) ? form[parentId].includes(item) : form[parentId] == item
        })
      )
    })
    let bool = findControl.condition === 'or' ? logicList.some((item) => item) : logicList.every((item) => item);
    if (!bool) delete formState.value[id];
    return bool
  }
  return true
}

//提交数据
const submitTo = (isSubmit: boolean) => {
  formRef.value?.validate().then(() => {
    console.log("打印获取数据", formState.value);
    if (!isSubmit) {
      return nextPage('next')
    }
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
  }).catch(({ errorFields }) => {
    if (errorFields && errorFields.length) {
      //滚动到没有回答的问题
      const firstErrorId: number = errorFields[0].name[0];
      questionItem.namedItem("item-" + firstErrorId)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
};

//上一页
const prevPage = () => {
  if (!answerIdRef.value)
    questionData.value[pageIndex.value].forEach(item => {
      delete formState.value[item.id]
    })
  nextPage("prev")
}

//分页
const nextPage = (type: 'next' | 'prev' = 'next') => {
  type === 'next' ? pageIndex.value++ : pageIndex.value--;
  if (isPageEmpty(questionData.value[pageIndex.value])) {
     nextPage(type);
  }
  questionItem[0].scrollIntoView({ behavior: 'smooth' });
}

//判断当前是否为空
const isPageEmpty = (question: questionType[]) => {
  return question.filter(item => isShow(item.id)).length === 0;
}
</script>
<style lang='scss' scoped>
.question {
  max-width: 1200px;
  max-height: 100%;
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
  margin-bottom: 10px;
  font-size: 16px;

  .ant-form-item {
    padding: 10px;
    background: #fff;
    border-radius: 5px;
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
    white-space: pre-wrap;

    &:hover {
      background: #f9f9f9;
    }
  }
}

@mixin transition-default() {

  &-enter-active,
  &-leave-active {
    transition: 0.2s cubic-bezier(0.25, 0.8, 0.5, 1) !important;
  }
}

.slide-x {
  @include transition-default();

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateX(-15px);
  }
}

.slide-x-reverse {
  @include transition-default();

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateX(15px);
  }
}

.ant-btn {
  margin-top: 10px;
}
</style>
