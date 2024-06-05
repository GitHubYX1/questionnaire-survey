<template>
  <div class="investigation">
    <div class="investigation-header flex-between">
      <div>
        <a-tooltip placement="bottom" title="返回我的项目">
          <home-filled @click="goBack" />
        </a-tooltip>
        <span style="margin-left: 20px">{{ questionnaire.id ? "编辑" : "创建" }}问卷</span>
      </div>
      <div class="header-button flex-between align-items">
        <a-button @click="previewClick">预览</a-button>
        <a-button type="primary" @click="save(false)">保存</a-button>
        <a-button class="release" @click="save(true)">发布</a-button>
      </div>
    </div>
    <div class="investigation-content">
      <div class="investigation-panel">
        <survey-control :questionMaxId="questionnaire.questionMaxId" @deriveContrl="questionnaire.deriveContrl" @uploadData="questionnaire.uploadData"></survey-control>
      </div>
      <div class="investigation-editor">
        <div class="editor-top" @click="dataTitle.open(questionnaire.title, questionnaire.content)">
          <div class="investigation-title">{{ questionnaire.title }}</div>
          <div class="investigation-intro" v-if="questionnaire.content" v-html="questionnaire.content"></div>
        </div>
        <div class="editor-list">
          <div class="survey-paging">
            第1页（共{{ questionnaire.totalPage }}页）
            <div class="paging-menu">
              <span class="paging-insert" @click="questionnaire.insert(questionnaire.insertNum !== -1 ? -1 : -2)">{{ questionnaire.insertNum !== -1 ? "在此题后插入新题" : "插入题目" }}</span>
            </div>
          </div>
          <survey-item
            v-for="(item, index) in questionnaire.question"
            :key="item.id"
            :index="index"
            :question="item"
            :insertNum="questionnaire.insertNum"
            :serialNum="questionnaire.serialNum(item.id).num"
            :showConcern="showConcern(item.id)"
            :optionLogic="optionLogic(item.id)"
            @optionAdd="optionAdd"
            @concern="concern"
          ></survey-item>
          <div class="editor-empty" v-if="questionnaire.question.length == 0">
            <a-empty description="暂无题目" />
          </div>
        </div>
      </div>
      <editor-title ref="dataTitle" @titleModify="questionnaire.titleModify"></editor-title>
      <batch-add ref="batchModal"></batch-add>
      <concern-front ref="concernFrontRef" @getFront="questionnaire.getFront"></concern-front>
      <concern-copy ref="concernCopyRef" @getCopy="questionnaire.getCopy"></concern-copy>
      <concern-option ref="concernOptionRef" @optionChange="optionChange"></concern-option>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { optionType, questionType } from "@/types/index";
import SurveyControl from "./components/survey-control.vue";
import SurveyItem from "./components/survey-item.vue";
import EditorTitle from "./components/editor-title.vue";
import BatchAdd from "./components/batch-add.vue";
import ConcernFront from "./components/concern-front.vue"; //题目向前关联
import ConcernCopy from "./components/concern-copy.vue"; //复制向前关联
import ConcernOption from "./components/concern-option.vue"; //复制向前关联
import { message, Modal } from "ant-design-vue";
import shortId from "shortid";
import { getTime } from "@/utils/index";
import { surveyStore } from "@/stores/survey";
import { questionnaireStore } from "@/stores/questionnaire";
import type { surveyType, controlOptionType } from "@/types/index";
import { typeEnum } from "@/assets/common/enums";
import cloneDeep from "lodash.clonedeep";

const router = useRouter();
const storeData = surveyStore();
const questionnaire = questionnaireStore();

const dataTitle = ref<any>(null);
const batchModal = ref<any>(null);
const concernFrontRef = ref<any>(null);
const concernCopyRef = ref<any>(null);
const concernOptionRef = ref<any>(null);
const serialRemoveType = [typeEnum.PARAGRAPH, typeEnum.PAGING];
const noConcernItem = [typeEnum.FILL, typeEnum.SLIDER, typeEnum.MATRIX_RADIO, typeEnum.MATRIX_CHECKBOX, typeEnum.MATRIX_SLIDER];

onMounted(() => {
  const surveyId = storeData.surveyId;
  const maxId = localStorage.getItem("MAXID");
  if (surveyId) {
    let survey = storeData.surveySelected(surveyId);
    if (survey) {
      //获取首次数据
      questionnaire.init(survey, maxId);
    } else {
      storeData.modifySurveyId("");
    }
  } else {
    questionnaire.reset();
  }
});

const goBack = () => {
  questionnaire.reset();
  router.replace("/project");
};

//选项增加
const optionAdd = (e: { index: number; optionIndex: number }) => {
  const optionIndex = e.optionIndex;
  const index = e.index;
  const optionData: optionType[] = questionnaire.question[index].option.concat();
  if (optionIndex == -2) {
    //批量增加
    const text = optionData.map((item) => item.content).join("\n");
    batchModal.value.batchOpen(index, text);
  } else {
    questionnaire.optionAdd(index, optionIndex);
  }
};

//保存数据
const save = (state: boolean) => {
  if (questionnaire.question.length == 0) {
    return Modal.warning({
      title: "提示",
      content: "当前问卷没有题目",
    });
  }
  questionnaire.state = state ? state : questionnaire.state;
  const survey: surveyType = {
    id: questionnaire.id,
    title: questionnaire.title,
    content: questionnaire.content,
    createTime: questionnaire.createTime,
    modifyTime: questionnaire.modifyTime,
    state: questionnaire.state,
    question: questionnaire.question,
    controlLogic: questionnaire.controlLogic,
    controlOption: questionnaire.controlOption,
  };
  if (questionnaire.id == "") {
    survey.id = shortId.generate();
    questionnaire.id = survey.id;
    survey.createTime = getTime();
    questionnaire.createTime = survey.createTime;
    storeData.surveyAdd(survey);
  } else {
    survey.modifyTime = getTime();
    questionnaire.modifyTime = survey.modifyTime;
    storeData.surveyModify(survey);
  }
  localStorage.setItem("MAXID", String(questionnaire.questionMaxId));
  storeData.modifySurveyId(questionnaire.id);
  message.success("保存成功！");
  if (state) {
    questionnaire.reset();
    router.replace("/project");
  }
};

//问卷预览
const previewClick = () => {
  if (questionnaire.id) {
    router.push("/preview?id=" + questionnaire.id);
  } else {
    Modal.warning({
      title: "提示",
      content: "当前问卷未保存",
    });
  }
};
//题目关联
const concern = (e: { index: number; id: number; title: string; state: number }) => {
  const { index, id, title, state } = e;
  const question: questionType[] = cloneDeep(questionnaire.question);
  const controlLogic = questionnaire.controlLogic.find((item) => item.childId === id);
  switch (state) {
    case 1:
      const data = question
        .slice(0, index)
        .filter((item) => !serialRemoveType.includes(item.type))
        .map((item, index) => ({ ...item, title: index + 1 + "." + item.title }))
        .filter((item) => !noConcernItem.includes(item.type));
      concernFrontRef.value.frontOpen(data, title, id, controlLogic);
      return;
    case 2:
      if (!controlLogic) return message.info("此题没有关联逻辑，无法复制！");
      const data2 = question.slice(index + 1).filter((item) => item.type !== typeEnum.PAGING);
      concernCopyRef.value.copyOpen(data2, title, id, controlLogic);
      return;
    case 3:
      const data3 = question
        .slice(0, index)
        .filter((item) => !serialRemoveType.includes(item.type))
        .map((item, index) => ({ ...item, title: index + 1 + "." + item.title }))
        .filter((item) => !noConcernItem.includes(item.type));
      const controlOption = questionnaire.controlOption?.filter((item) => item.childId === id);
      concernOptionRef.value.optionOpen(data3, title, question[index].option, id, controlOption);
      return;
    default:
      return;
  }
};
//显示关联
const showConcern = (id: number) => {
  const controlLogic = questionnaire.controlLogic.find((item) => item.childId === id);
  return questionnaire.logicText(controlLogic);
};

// 获取选项关联
const optionChange = (optionLogic: controlOptionType) => {
  questionnaire.getControlOption(optionLogic);
};
//获取当前项的选项关联
const optionLogic = (id: number) => {
  return questionnaire.controlOption.filter((item) => item.childId === id);
};
</script>

<style lang="scss" scoped>
.investigation {
  width: 1400px;
  height: 100%;
  margin: 0 auto;
}

.header-button {
  width: 220px;
}

.release {
  background: #0d0d0d;
  color: #fff;
  border-color: #0d0d0d;

  &:hover,
  &:first {
    color: #fff;
    border-color: #0d0d0d;
  }
}

.investigation-header {
  height: 50px;
  line-height: 50px;
  border-bottom: 1px solid #efefef;
  margin-bottom: 10px;
  font-size: 20px;
}

.investigation-content {
  height: calc(100% - 60px);
}

.investigation-panel {
  width: 300px;
  max-height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 15px;
  float: left;
  background: #fff;
  border-radius: 10px;
}

.investigation-editor {
  width: 1060px;
  max-height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #efefef;
  background: #fff;
  float: right;
}

.editor-top {
  padding: 15px;
  border-bottom: 1px solid #efefef;
  cursor: pointer;
}

.investigation-title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
}

.investigation-intro {
  margin-top: 10px;
}

.editor-empty {
  padding: 30px;
}

.survey-paging {
  font-size: 16px;
  padding: 20px 10px 10px 10px;
  border-bottom: 1px solid #efefef;
  .paging-menu {
    text-align: left;
    height: 30px;
    line-height: 30px;
  }
  .paging-insert {
    color: #40a9ff;
    cursor: pointer;
    text-decoration: underline;
    display: none;
  }
  &:hover .paging-insert {
    display: block;
  }
}
</style>
