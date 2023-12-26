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
					<survey-item
						v-for="(item, index) in questionnaire.question"
						:key="item.id"
						:index="index"
						:question="item"
						:insertNum="questionnaire.insertNum"
						:serialNum="serialNum(item.id).num"
						:showConcern="showConcern(item.id)"
						@optionAdd="optionAdd"
						@concern="concern"
					></survey-item>
					<div class="editor-empty" v-if="questionnaire.question.length == 0">
						<a-empty description="暂无题目" />
					</div>
				</div>
			</div>
			<editor-title ref="dataTitle" @titleModify="questionnaire.titleModify"></editor-title>
			<batch-add ref="batchModal" @optionBatchAdd="questionnaire.optionBatchAdd"></batch-add>
			<concern-front ref="concernFrontRef" @getFront="questionnaire.getFront"></concern-front>
			<concern-copy ref="concernCopyRef" @getCopy="questionnaire.getCopy"></concern-copy>
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
import { message, Modal } from "ant-design-vue";
import shortId from "shortid";
import { mostValue, getTime } from "@/utils/index";
import { surveyStore } from "@/stores/survey";
import { questionnaireStore } from "@/stores/questionnaire";

const router = useRouter();
const storeData = surveyStore();
const questionnaire = questionnaireStore();

const dataTitle = ref<any>(null);
const batchModal = ref<any>(null);
const concernFrontRef = ref<any>(null);
const concernCopyRef = ref<any>(null);

//获取序号
const serialNum = (id: number, parent: string[] = []) => {
	let num = 0;
	let answer: number[] = [];
	for (let i = 0; i < questionnaire.question.length; i++) {
		let data = questionnaire.question[i];
		if (data.type !== "段落说明") num++;
		if (data.id == id) {
			if (parent.length !== 0) {
				for (let j = 0; j < parent.length; j++) {
					answer.push(data.option.indexOf(data.option.filter((item) => String(item.id) == parent[j])[0]) + 1);
				}
			}
			return { num, answer };
		}
	}
	return { num, answer };
};

onMounted(() => {
	let surveyId = storeData.surveyId;
	let maxId = localStorage.getItem("MAXID");
	if (surveyId) {
		let survey = storeData.surveySelected(surveyId);
		if (survey) {
			//获取首次数据
			questionnaire.init(survey, maxId);
		} else {
			storeData.modifySurveyId("");
		}
	}
});

const goBack = () => {
	router.replace("/project");
};

//选项增加
const optionAdd = (e: { index: number; optionIndex: number }) => {
	let optionIndex = e.optionIndex;
	let index = e.index;
	let optionData: optionType[] = questionnaire.question[index].option.concat();
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
		questionnaire.optionAdd(index, optionData);
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
	if (questionnaire.id == "") {
		questionnaire.id = shortId.generate();
		questionnaire.createTime = getTime();
		storeData.surveyAdd(questionnaire);
	} else {
		questionnaire.modifyTime = getTime();
		storeData.surveyModify(questionnaire);
	}
	localStorage.setItem("MAXID", String(questionnaire.questionMaxId));
	storeData.modifySurveyId(questionnaire.id);
	message.success("保存成功！");
	if (state) {
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
	let { index, id, title, state } = e;
	let question: questionType[] = JSON.parse(JSON.stringify(questionnaire.question));
	let controlLogic = questionnaire.controlLogic.find((item) => item.childId === id);
	switch (state) {
		case 1:
			let data = question.slice(0, index).filter((item) => item.type !== "段落说明");
			concernFrontRef.value.frontOpen(data, title, id, controlLogic);
			return;
		case 2:
			if (!controlLogic) return message.info("此题没有关联逻辑，无法复制！");
			let data2 = question.slice(index + 1);
			concernCopyRef.value.copyOpen(data2, title, id, controlLogic);
			return;
		default:
			return;
	}
};
//显示关联
const showConcern = (id: number) => {
	let controlLogic = questionnaire.controlLogic.find((item) => item.childId === id);
	if (!controlLogic) return "";
	let questionIds = controlLogic.questionIds.split(",").map((item) => Number(item));
	let parentAnswer = controlLogic.parentAnswer.split("|");
	let str = "依赖于";
	for (let i in questionIds) {
		let serial = serialNum(questionIds[i], parentAnswer[i].split(","));
		str += `第${serial.num}题第${serial.answer.sort().join("、")}选项，`;
	}
	if (questionIds.length > 1) {
		str += `为“${controlLogic.condition === "and" ? "且" : "或"}”的关系`;
	} else {
		str = str.slice(0, -1);
	}
	return str;
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
</style>
