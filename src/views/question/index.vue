<template>
  <div class="question">
    <header class="question-header" v-if="infoHeader.title">
      <h2 class="header-title">{{ infoHeader.title }}</h2>
    </header>
    <section class="question-section">
      <!-- 前言 -->
      <div class="question-content" v-if="infoHeader.content && pageIndex === 0" v-html="infoHeader.content"></div>
      <a-skeleton active :paragraph="{ rows: 16 }" :loading="questionData.length === 0">
        <a-form layout="vertical" class="question-list" :model="formState" ref="formRef">
          <template v-for="item in questionData[pageIndex]" :key="item.id">
            <transition name="slide-x" mode="out-in">
              <div class="question-item" :id="'item-' + item.id" v-if="item.isVisible">
                <div v-if="item.type === PARAGRAPH" v-html="item.title"></div>
                <div v-else-if="matrixOptionShow(item.type)" class="ant-form-item">
                  <div class="matrix-title">{{ item.title }}</div>
                  <matrix-item :question="item" :formState="formState" :rules="rulesValidate(item)"></matrix-item>
                </div>
                <a-form-item v-else :label="item.title" :key="item.id" :name="item.id" :rules="rulesValidate(item)">
                  <a-radio-group v-if="item.type === RADIO" class="grid" :style="generateColumn(item.column)"
                    v-model:value="formState[item.id]">
                    <a-radio class="flex item-option" v-for="subItem in filterAnswer(item.hideNum, item.option)"
                      :key="subItem.id" :value="subItem.id" :name="subItem.content"
                      @change="changeAnswer(item.id, $event.target.value)">{{
                        subItem.content.replace(/\\n/g,
                          '\n') }}</a-radio>
                  </a-radio-group>
                  <a-checkbox-group v-else-if="item.type === CHECKBOX" class="grid" :style="generateColumn(item.column)"
                    v-model:value="formState[item.id]">
                    <a-checkbox class="flex item-option" v-for="subItem in filterAnswer(item.hideNum, item.option)"
                      :key="subItem.id" :value="subItem.id" :name="subItem.content"
                      @change="changeAnswer(item.id, $event.target.value)">{{ subItem.content.replace(/\\n/g,
                        '\n') }}</a-checkbox>
                  </a-checkbox-group>
                  <a-select v-else-if="item.type === DROP" class="drop-down" placeholder="请选择下拉列表"
                    v-model:value="formState[item.id]" :options="filterAnswer(item.hideNum, item.option)"
                    :fieldNames="{ label: 'content', value: 'id' }" @change="changeAnswer(item.id, $event)"></a-select>
                  <a-rate v-else-if="item.type === SCORE" v-model:value="formState[item.id]" style="font-size: 28px"
                    :count="item.option.length" @change="changeAnswer(item.id, $event)" />
                  <template v-else-if="item.type === FILL">
                    <a-input v-if="item.column === 1" v-model:value="formState[item.id]"></a-input>
                    <a-textarea v-else :rows="item.column" v-model:value="formState[item.id]" />
                  </template>
                  <slider v-else-if="item.type === SLIDER" :min="item.option[0]" :max="item.option[1]"
                    v-model:value="formState[item.id]"></slider>
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
import type { FormInstance, Rule } from "ant-design-vue/es/form";
import type { questionType, answerType, surveyAnswerType, QuestionControlType, optionType, questionListType } from "@/types/index";
import { surveyStore } from "@/stores/survey";
import { getTime, timeDiff } from "@/utils/index";
import { answerSave, answerSelected } from "@/computed/answer";
import { isMobile, isIdCard, isEmail, isQQ, isTel, isNumber, isInteger } from "@/utils/validate";
import { typeEnum, validateEnum } from "@/assets/common/enums";
import slider from "@/components/slider/slider.vue";
import matrixItem from "@/components/matrix-item/matrix-item.vue";

const { RADIO, CHECKBOX, DROP, SCORE, FILL, PAGING, PARAGRAPH, SLIDER, MATRIX_RADIO, MATRIX_CHECKBOX, MATRIX_SLIDER } = typeEnum;

const fillValidateMap = {
  [validateEnum.ID_CARD]: { msg: "请输入正确的身份证号", fn: isIdCard },
  [validateEnum.MOBILE]: { msg: "请输入正确的手机号", fn: isMobile },
  [validateEnum.TEL]: { msg: "请输入正确的固话号码", fn: isTel },
  [validateEnum.NUMBER]: { msg: "请输入数字", fn: isNumber },
  [validateEnum.INTEGER]: { msg: "请输入正整数", fn: isInteger },
  [validateEnum.QQ]: { msg: "请输入正确的QQ号", fn: isQQ },
  [validateEnum.EMAIL]: { msg: "请输入正确的邮箱", fn: isEmail },
}

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
const questionData = ref<questionListType[][]>([]);
const formState = ref<Record<string, any>>({});
const formRef = ref<FormInstance | null>(null);
const startTime = ref<string>("");
const controlData = ref<QuestionControlType[]>([]);
const optionLogic = ref<QuestionControlType[]>([]);
const questionItem = document.getElementsByClassName("question-item");//获取题目元素
const pageIndex = ref(0);
const answerIdRef = ref("");

// 矩阵显示
const matrixOptionShow = (type:typeEnum) => {
  return [MATRIX_RADIO, MATRIX_CHECKBOX, MATRIX_SLIDER].includes(type);
};

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
    //获取逻辑
    controlData.value = survey.controlLogic.map(item => ({
      id: item.childId,
      parentIds: item.questionIds.split(',').map((item: string) => Number(item)),
      condition: item.condition,
      parentAnswer: item.parentAnswer.split('|').map((item: string) =>
        item.split(',').map((id) => Number(id)),
      ),
    }))
    optionLogic.value = survey.controlOption.map(item => ({
      id: item.childId,
      parentIds: item.questionIds.split(',').map((item: string) => Number(item)),
      condition: item.condition,
      optionId: item.optionId,
      parentAnswer: item.parentAnswer.split('|').map((item: string) =>
        item.split(',').map((id) => Number(id)),
      ),
    })) || []
    console.log("optionLogic", optionLogic.value);
    startTime.value = getTime();
    // 获取题目列表
    const questionLsit: questionListType[][] = [[]];
    let page = 0;
    survey.question.forEach(item => {
      if(item.isHide !== 1){
        if (item.type !== PAGING) {
        const show = isQuestionVisible(item.id, controlData.value);
        const hideNum = isOptionVisible(item.id, optionLogic.value);
        questionLsit[page].push({
          ...item,
          isVisible: show && (hideNum.length === 0 ? true : hideNum.length !== item.option.length),
          hideNum,
        });
      } else {
        page++;
        questionLsit.push([]);
      }
      }
    })
    console.log("questionLsit", questionLsit);
    questionData.value = questionLsit.filter(item => item.length !== 0);
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

// 是否显示题目
const isQuestionVisible = (id: number, control: QuestionControlType[]) => {
  const findControl = control.find((item) => item.id === id);
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
    return findControl.condition === 'or' ? logicList.some((item) => item) : logicList.every((item) => item);
  }

  return true;
}

// 是否显示选项
const isOptionVisible = (id: number, logic: QuestionControlType[]) => {
  const filterOption = logic.filter((item) => item.id === id);
  const optionShow: number[] = []
  // 选择控制逻辑处理
  if (filterOption.length) {
    const form = unref(formState);
    filterOption.forEach((item) => {
      for (const i in item.parentIds) {
        const parentId = item.parentIds[i];
        const answer = item.parentAnswer[i];
        const logicSome = answer.some(item => {
          return Array.isArray(form[parentId]) ? form[parentId].includes(item) : form[parentId] == item
        })
        if (!logicSome && item.optionId) optionShow.push(item.optionId)
      }
    })
  }
  return optionShow;
}

// 更改答案
const changeAnswer = (id: number, value: number | number[]) => {
  const childControl = controlData.value.filter((item) => item.parentIds.includes(id));
  const filterOption = optionLogic.value.filter((item) => item.parentIds.includes(id));
  formState.value[id] = value;
  if (childControl.length || filterOption.length) {
    const form = unref(formState);
    questionData.value.forEach((item) => {
      item.forEach((item2) => {
        const show = isQuestionVisible(item2.id, childControl);
        const hideNum = isOptionVisible(item2.id, filterOption);
        const optionShow = hideNum.length === 0 || hideNum.length !== item2.option.length;
        if (!show || !optionShow) {
          if(!item2.children || item2.children.length === 0){
            delete formState.value[item2.id];
          }else{
            for(const son of item2.children){
              delete formState.value[son.id];
            }
          }
        } else if (hideNum.length && form[item2.id] !== undefined) {
          let formId = form[item2.id]
          formId = Array.isArray(formId) ? formId.filter(item => !hideNum.includes(item)) : (!hideNum.includes(formId) ? form : '');
          formState.value[item2.id] = formId;
        }
        item2.isVisible = show && optionShow;
        item2.hideNum = hideNum;
      })
    })
  }
}

// 选项筛选
const filterAnswer = (hideNum: number[] | undefined, option: optionType[]) => {
  if (hideNum?.length) {
    return option.filter(item => !hideNum.includes(item.id))
  } else {
    return option;
  }
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
    return
  }
  questionItem[0].scrollIntoView({ behavior: 'smooth' });
}

//判断当前是否为空
const isPageEmpty = (question: questionListType[]) => {
  return question.filter(item => item.isVisible).length === 0;
}

// 验证规则
const rulesValidate = (item: questionType) => {
  return item.must ? [{
    required: true, validator: (_rule: Rule, value: string | number | number[]) => {
      // 对value进行初步的类型和空值检查
      if ((!value && value !== 0) || (Array.isArray(value) && value.length === 0)) {
        return Promise.reject("请完成该评价");
      }
      // 填空题内容校验
      if (typeof (value) === "string" && item.validateType !== validateEnum.DEFAULT) {
        const fvm = fillValidateMap[item.validateType];
        if (fvm && !fvm.fn(value)) {
          return Promise.reject(fvm.msg);
        }
      }
      // 多选题选项数量校验
      if (Array.isArray(value)) {
        if (item.chooseMin !== 0 && value.length < item.chooseMin) {
          return Promise.reject(`最少选择${item.chooseMin}项`);
        }
        if (item.chooseMax !== 0 && value.length > item.chooseMax) {
          return Promise.reject(`最多选择${item.chooseMax}项`);
        }
      }
      return Promise.resolve();
    }, trigger: 'change'
  }] : [];
}
</script>
<style lang='scss' scoped>
.question {
  max-width: 1000px;
  max-height: 100%;
  margin: 0 auto;
}

.question-header {
  padding: 10px 30px;
  background: #2071e2;
}

.question-section {
  padding: 10px;
}

.header-title {
  text-align: center;
  color: #fff;
  font-weight: 700;
  margin: 0;
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

.matrix-title{
  font-size: 16px;
  margin-bottom: 10px;
}
</style>
