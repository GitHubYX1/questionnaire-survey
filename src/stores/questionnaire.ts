import { inject } from "vue";
import { defineStore } from "pinia";
import { mostValue, getTime, optionInit } from "@/utils/index";
import type { typeType, optionType, questionType, surveyType, controlLogicType, loadingType } from "@/types/index";

/**
 * 问卷类型
 * @param questionMaxId 问题最大id
 * @param insertNum 要插入项
 * @param editId 编辑id
 */
interface questionnaireType extends surveyType {
	questionMaxId: number;
	insertNum: number;
	editId: number;
	loading:loadingType | undefined;
}

export const questionnaireStore = defineStore("questionnaire", {
	state: (): questionnaireType => ({
		id: "",
		title: "测试问卷",
		content: "",
		createTime: "",
		modifyTime: "",
		state: false,
		question: [],
		controlLogic: [],
		questionMaxId: 1000,
		insertNum: -1,
		editId: -1,
		loading:inject<loadingType>("loading")
	}),
	actions: {
		//初始化
		init(survey: surveyType, maxId: string | null) {
			this.id = survey.id;
			this.title = survey.title;
			this.content = survey.content;
			this.createTime = survey.createTime;
			this.modifyTime = survey.modifyTime;
			this.state = survey.state;
			this.question = survey.question;
			this.controlLogic = survey.controlLogic;
			this.questionMaxId = maxId ? Number(maxId) : mostValue(survey.question, "id");
		},
		//清空
		reset() {
			this.id = "";
			this.title = "测试问卷";
			this.content = "";
			this.createTime = getTime();
			this.modifyTime = getTime();
			this.state = false;
			this.question = [];
			this.controlLogic = [];
			this.questionMaxId = 1000;
			this.insertNum = -1;
			this.editId = -1;
		},
		//打开编辑
		editCount(id: number) {
			this.editId = id;
		},
		//关闭编辑
		resetting() {
			document.getElementById("focal")?.focus();
			this.editId = -1;
		},
		//修改顶部标题
		titleModify(e: { title: string; content: string }) {
			this.title = e.title;
			this.content = e.content;
		},
		//获取控件
		deriveContrl(contrl: { title: string; type: typeType }) {
			const questionAdd: questionType = {
				id: this.questionMaxId,
				title: contrl.title,
				type: contrl.type,
				option: [],
				must: 1,
				column: 1,
			};
			if (contrl.type === "单选" || contrl.type == "多选") {
				questionAdd.option = optionInit();
			}
			if (this.insertNum == -1) {
				this.question.push(questionAdd);
			} else {
				this.question.splice(this.insertNum + 1, 0, questionAdd);
				this.insertNum = -1;
			}
			this.questionMaxId += 1;
			console.log("打印数据", this.question);
			this.resetting(); 
		},
		//获取导入数据
		uploadData(e: { question: questionType[]; radio: string }) {
			let { question, radio } = e;
			this.loading?.start("问卷导入中，请稍等...");
			setTimeout(()=> {
				if (radio == "add") {
					this.question = this.question.concat(question);
				} else {
					this.question = question;
				}
				this.questionMaxId = mostValue(this.question, "id");
				this.resetting(); 
				this.loading?.end();
			},100)
		},
		//复制
		copy(question: questionType, index: number) {
			question.id = this.questionMaxId;
			this.question.splice(index + 1, 0, question);
			this.questionMaxId += 1;
			this.resetting(); 
		},
		//删除
		erasure(index: number) {
			this.question.splice(index, 1);
			this.resetting(); 
		},
		//移动
		move(index: number, action: string) {
			let arr = this.question;
			if (action == "上") {
				this.question.splice(index - 1, 1, ...arr.splice(index, 1, arr[index - 1]));
			} else if (action == "下") {
				this.question.splice(index, 1, ...arr.splice(index + 1, 1, arr[index]));
			} else if (action == "前") {
				this.question.unshift(arr.splice(index, 1)[0]);
			} else if (action == "后") {
				this.question.push(arr.splice(index, 1)[0]);
			}
			this.resetting();
		},
		//插入数据
		insert(index: number) {
			this.insertNum = index;
			this.resetting(); 
		},
		//选项是否必答
		mustSelect(index: number, must: boolean) {
			this.question[index].must = must ? 1 : 0;
		},
		//类型修改
		typeModify(index: number, type: typeType) {
			if (this.question[index].type == "填空" && type !== "填空") {
				this.question[index].option = optionInit();
			} else if (type === "填空") {
				this.question[index].option = [];
				this.question[index].column = 1;
			}
			this.question[index].type = type;
		},
		//添加
		optionAdd(index: number, option: optionType[]) {
			this.question[index].option = option;
		},
		//批量添加
		optionBatchAdd(e: { index: number; optionText: string }) {
			let option: optionType[] = e.optionText.split("\n").map((item, index) => ({ id: index + 1, content: item }));
			this.question[e.index].option = option;
		},
		//选项移除
		optionRemove(index: number, optionIndex: number) {
			let arr = this.question[index].option.concat();
			arr.splice(optionIndex, 1);
			this.question[index].option = arr;
		},
		//选项移动
		optionMove(index: number, optionIndex: number, action: string) {
			let arr = this.question[index].option.concat();
			if (action == "上") {
				arr.splice(optionIndex - 1, 1, ...arr.splice(optionIndex, 1, arr[optionIndex - 1]));
			} else if (action == "下") {
				arr.splice(optionIndex, 1, ...arr.splice(optionIndex + 1, 1, arr[optionIndex]));
			}
			this.question[index].option = arr;
		},
		//获取向前关联
		getFront(front: controlLogicType) {
			if (!front.parentAnswer) {
				return (this.controlLogic = this.controlLogic.filter((item) => item.childId !== front.childId));
			}
			let index = this.controlLogic.map((item) => item.childId).indexOf(front.childId);
			if (index === -1) {
				this.controlLogic.push(front);
			} else {
				this.controlLogic[index] = front;
			}
		},
		//复制关联
		getCopy(e: { id: number; childId: number[]; data: controlLogicType[] }) {
			if (e.childId.length != 0) {
				this.controlLogic = this.controlLogic.filter((item) => e.childId.indexOf(item.childId) === -1);
				this.controlLogic = this.controlLogic.concat(e.data);
				console.log("打印所有关联题surveyInfo.controlLogic", this.controlLogic);
			}
		},
	},
});
