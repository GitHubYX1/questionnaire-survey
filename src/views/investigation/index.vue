<template>
  <div class="investigation">
    <div class="investigation-header flex-between">
      <div>
        <a-tooltip placement="bottom" title="返回我的项目">
          <home-filled @click="goBack" />
        </a-tooltip>
        <span style="margin-left: 20px">{{ surveyInfo.id ? "编辑" : "创建" }}问卷</span>
      </div>
      <div class="header-button flex-between align-items">
        <a-button @click="previewClick">预览</a-button>
        <a-button type="primary" @click="save(false)">保存</a-button>
        <a-button class="release" @click="save(true)">发布</a-button>
      </div>
    </div>
    <div class="investigation-content">
      <div class="investigation-panel">
        <survey-control @deriveContrl="deriveContrl"></survey-control>
      </div>
      <div class="investigation-editor">
        <div class="editor-top" @click="dataTitle.open(surveyInfo.title, surveyInfo.content)">
          <div class="investigation-title">{{ surveyInfo.title }}</div>
          <div class="investigation-intro" v-if="surveyInfo.content" v-html="surveyInfo.content"></div>
        </div>
        <div class="editor-list">
          <survey-item
            v-for="(item, index) in surveyInfo.question"
            :key="item.id"
            :index="index"
            :question="item"
            :insertNum="insertNum"
            :serialNum="serialNum(item.id)"
            :showConcern="showConcern(item.id)"
            @insert="insert"
            @copy="copy"
            @erasure="erasure"
            @move="move"
            @mustSelect="mustSelect"
            @typeModify="typeModify"
            @optionAdd="optionAdd"
            @optionRemove="optionRemove"
            @optionMove="optionMove"
            @concern="concern"
          ></survey-item>
          <div class="editor-empty" v-if="surveyInfo.question.length == 0">
            <a-empty description="暂无题目" />
          </div>
        </div>
      </div>
      <editor-title ref="dataTitle" @titleModify="titleModify"></editor-title>
      <batch-add ref="batchModal" @optionBatchAdd="optionBatchAdd"></batch-add>
      <concern-front ref="concernFrontRef" @getFront="getFront"></concern-front>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { typeType, optionType, questionType, surveyType, controlLogicType } from "@/types/index";
import SurveyControl from "./components/survey-control.vue";
import SurveyItem from "./components/survey-item.vue";
import EditorTitle from "./components/editor-title.vue";
import BatchAdd from "./components/batch-add.vue";
import ConcernFront from "./components/concern-front.vue"; //题目向前关联
import { message, Modal } from "ant-design-vue";
import shortId from "shortid";
import { mostValue, getTime } from "@/utils/index";
import { editStore, surveyStore } from "@/stores/survey";

const router = useRouter();
const edit = editStore();
const storeData = surveyStore();

let surveyInfo = reactive<surveyType>({
  id: "",
  title: "测试问卷",
  content: "",
  createTime: "",
  modifyTime: "",
  state: false,
  question: [],
  controlLogic:[]
});

const questionMaxId = ref(1000);
const dataTitle = ref<any>(null);
const batchModal = ref<any>(null);
const concernFrontRef = ref<any>(null);
const insertNum = ref(-1);
let optionInit=():optionType[] => {
  return [
  { id: 1, content: "选项1" },
  { id: 2, content: "选项2" },
];
}
//获取序号
const serialNum = (id: number) => {
  let num = 0;
  for (let i = 0; i < surveyInfo.question.length; i++) {
    let data = surveyInfo.question[i];
    if (data.type !== "段落说明") num++;
    if (data.id == id) return num;
  }
  return num;
};

onMounted(() => {
  let surveyId = localStorage.getItem("SURVEYID");
  let maxId = localStorage.getItem("MAXID");
  if (surveyId) {
    let survey = storeData.surveySelected(surveyId);
    if (survey) {
      surveyInfo.id = survey.id;
      surveyInfo.title = survey.title;
      surveyInfo.content = survey.content;
      surveyInfo.createTime = survey.createTime;
      surveyInfo.modifyTime = survey.modifyTime;
      surveyInfo.state = survey.state;
      surveyInfo.question = survey.question;
      surveyInfo.controlLogic = survey.controlLogic;
      questionMaxId.value = maxId
        ? Number(maxId)
        : mostValue(surveyInfo.question, "id");
    } else {
      localStorage.setItem("SURVEYID", "");
    }
  }
});

const goBack = () => {
  router.replace("/project");
};

//修改顶部
const titleModify = (e: { title: string; content: string }) => {
  surveyInfo.title = e.title;
  surveyInfo.content = e.content;
};
//获取控件
const deriveContrl = (contrl: { title: string; type: typeType }) => {
  let questionAdd: questionType = {
    id: questionMaxId.value,
    title: contrl.title,
    type: contrl.type,
    option: [],
    must: 1,
    column: 1
  };
  if (contrl.type === "单选" || contrl.type == "多选") {
    questionAdd.option = optionInit();
  }
  if (insertNum.value == -1) {
    surveyInfo.question.push(questionAdd);
  } else {
    surveyInfo.question.splice(insertNum.value + 1, 0, questionAdd);
    insertNum.value = -1;
  }
  questionMaxId.value += 1;
  console.log("打印数据", surveyInfo.question);
  edit.resetting(); //关闭编辑
};
//插入数据
const insert = (index: number) => {
  insertNum.value = index;
  edit.resetting(); //关闭编辑
};
//复制
const copy = (e: { question: questionType; index: number }) => {
  let question = JSON.parse(JSON.stringify(e.question));
  question.id = questionMaxId.value;
  surveyInfo.question.splice(e.index + 1, 0, question);
  questionMaxId.value += 1;
  edit.resetting(); //关闭编辑
};
//删除
const erasure = (index: number) => {
  surveyInfo.question.splice(index, 1);
  edit.resetting(); //关闭编辑
};
//移动
const move = (e: { index: number; action: string }) => {
  let index = e.index;
  let action = e.action;
  let arr = surveyInfo.question;
  if (action == "上") {
    arr.splice(index - 1, 1, ...arr.splice(index, 1, arr[index - 1]));
  } else if (action == "下") {
    arr.splice(index, 1, ...arr.splice(index + 1, 1, arr[index]));
  } else if (action == "前") {
    arr.unshift(arr.splice(index, 1)[0]);
  } else if (action == "后") {
    arr.push(arr.splice(index, 1)[0]);
  }
  edit.resetting(); //关闭编辑
};
//选项是否必答
const mustSelect = (e: { index: number; must: boolean }) => {
  surveyInfo.question[e.index].must = e.must ? 1 : 0;
};
//类型修改
const typeModify = (e: { index: number; type: typeType }) => {
  if (surveyInfo.question[e.index].type == "填空" && e.type !== "填空") {
    surveyInfo.question[e.index].option = optionInit();
  } else if (e.type === "填空") {
    surveyInfo.question[e.index].option = [];
    surveyInfo.question[e.index].column = 1;
  }
  surveyInfo.question[e.index].type = e.type;
};
//选项增加
const optionAdd = (e: { index: number; optionIndex: number }) => {
  let optionIndex = e.optionIndex;
  let index = e.index;
  let optionData: optionType[] = surveyInfo.question[index].option.concat();
  if (optionIndex == -2) {
    //批量增加
    let text = optionData.map((item) => item.content).join("\n");
    batchModal.value.batchOpen(index, text);
  } else {
    let id = mostValue(optionData, "id");
    let options: optionType = { id, content: "选项" + id };
    if (optionIndex == -1) {
      optionData.push(options);
    } else {
      optionData.splice(optionIndex + 1, 0, options);
    }
    surveyInfo.question[index].option = optionData;
  }
};
//批量添加
const optionBatchAdd = (e: { index: number; optionText: string }) => {
  let option: optionType[] = e.optionText.split("\n").map((item, index) => ({ id: index + 1, content: item }));
  surveyInfo.question[e.index].option = option;
};
//选项移除
const optionRemove = (e: { index: number; optionIndex: number }) => {
  let arr = surveyInfo.question[e.index].option.concat();
  arr.splice(e.optionIndex, 1);
  surveyInfo.question[e.index].option = arr;
};
//选项移动
const optionMove = (e: {
  index: number;
  optionIndex: number;
  action: string;
}) => {
  let index = e.index;
  let optionIndex = e.optionIndex;
  let arr = surveyInfo.question[index].option.concat();
  if (e.action == "上") {
    arr.splice(optionIndex - 1,1,...arr.splice(optionIndex, 1, arr[optionIndex - 1]));
  } else if (e.action == "下") {
    arr.splice(optionIndex,1,...arr.splice(optionIndex + 1, 1, arr[optionIndex]));
  }
  surveyInfo.question[index].option = arr;
};

//保存数据
const save = (state: boolean) => {
  if (surveyInfo.question.length == 0) {
    return Modal.warning({
      title: "提示",
      content: "当前问卷没有题目",
    });
  }
  surveyInfo.state = state ? state : surveyInfo.state;
  if (surveyInfo.id == "") {
    surveyInfo.id = shortId.generate();
    surveyInfo.createTime = getTime();
    storeData.surveyAdd(surveyInfo);
  } else {
    surveyInfo.modifyTime = getTime();
    storeData.surveyModify(surveyInfo);
  }
  localStorage.setItem("MAXID", String(questionMaxId.value));
  localStorage.setItem("SURVEYID", surveyInfo.id);
  message.success("保存成功！");
  if (state) {
    router.replace("/project");
  }
};

//问卷预览
const previewClick = () => {
  if (surveyInfo.id) {
    router.push("/preview?id=" + surveyInfo.id);
  } else {
    Modal.warning({
      title: "提示",
      content: "当前问卷未保存",
    });
  }
};
//题目关联
const concern = (e: { index: number; id: number; title: string; state: number }) => {
  let { index, id, title, state } = e;
  let question:questionType[] = JSON.parse(JSON.stringify(surveyInfo.question))
  let controlLogic = surveyInfo.controlLogic.find(item=> item.childId === id);
  switch (state) {
    case 1:
      let data = question.slice(0, index).filter(item => item.type !== '段落说明');
      concernFrontRef.value.frontOpen(data, title, id, controlLogic);
      return;
    case 2:
      return
    default:
      return;
  }
}
//显示关联
const showConcern = (id:number)=>{
  let controlLogic = surveyInfo.controlLogic.find(item=> item.childId === id);
  if(!controlLogic) return ''
  let questionIds = controlLogic.questionIds.split(',').map(item => Number(item))
  let parentAnswer =controlLogic.parentAnswer.split('|')
  let str = '依赖于'
  for(let i in questionIds){
    str += `第${serialNum(questionIds[i])}题第${parentAnswer[i]}选项，`
  }
  if(questionIds.length>1){
    str +=`为“${controlLogic.condition === 'or' ? '且' : '或'}”的关系`
  }else{
    str = str.substring(0, str.length - 1);
  }
  return str
}
//获取向前关联
const getFront = (front:controlLogicType) =>{
  if(!front.parentAnswer){
    return surveyInfo.controlLogic = surveyInfo.controlLogic.filter(item=> item.childId !== front.childId);
  }
  let index = surveyInfo.controlLogic.map(item=> item.childId).indexOf(front.childId);
  if(index === -1){
    surveyInfo.controlLogic.push(front)
  }else{
    surveyInfo.controlLogic[index] = front
  }
}
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
</style>
