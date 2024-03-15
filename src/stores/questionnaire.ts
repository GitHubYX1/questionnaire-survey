import { inject } from "vue";
import { defineStore } from "pinia";
import { mostValue, getTime, optionInit, scoreOptionInit } from "@/utils/index";
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
  loading: loadingType | undefined;
  totalPage: number;
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
    insertNum: -2,
    editId: -1,
    loading: inject<loadingType>("loading"),
    totalPage: 1,
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
      const totalPage = survey.question.filter((item) => item.type === "分页").length;
      this.totalPage = totalPage + 1;
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
      this.insertNum = -2;
      this.editId = -1;
      this.totalPage = 1;
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
      if (contrl.type === "单选" || contrl.type == "多选" || contrl.type == "下拉") {
        questionAdd.option = optionInit();
      } else if (contrl.type === "评分") {
        questionAdd.option = scoreOptionInit(5);
      } else if (contrl.title === "简答题") {
        questionAdd.column = 2;
      } else if (contrl.title === "分页") {
        this.totalPage++;
        questionAdd.currentPage = this.totalPage;
        questionAdd.must = 0;
      }
      if (this.insertNum == -2) {
        this.question.push(questionAdd);
      } else {
        this.question.splice(this.insertNum + 1, 0, questionAdd);
        this.insertNum = -2;
      }
      this.questionMaxId += 1;
      console.log("打印数据", this.question);
      this.resetting();
    },
    //获取导入数据
    uploadData(e: { question: questionType[]; radio: string }) {
      let { question, radio } = e;
      this.loading?.start("问卷导入中，请稍等...");
      setTimeout(() => {
        if (radio === "create") this.totalPage = 1;
        question.forEach((item) => {
          if (item.type === "分页") {
            this.totalPage++;
            item.currentPage = this.totalPage;
          }
        });
        this.question = radio === "add" ? this.question.concat(question) : question;
        this.questionMaxId = mostValue(this.question, "id");
        this.resetting();
        this.loading?.end();
      }, 100);
    },
    //复制
    copy(question: questionType, index: number) {
      question.id = this.questionMaxId;
      this.question.splice(index + 1, 0, question);
      this.questionMaxId += 1;
      this.resetting();
    },
    //删除
    erasure(id: number, index: number) {
      if (this.question[index].type === "分页") {
        this.totalPage--;
        this.question.forEach((item, sonIndex) => {
          if (item.currentPage && sonIndex > index) {
            item.currentPage--;
          }
        });
      }
      this.controlLogic = this.controlLogic.filter((item) => item.childId !== id && !item.questionIds.includes(String(id)));
      this.question.splice(index, 1);
      this.resetting();
    },
    //移动
    move(index: number, action: string) {
      let arr = this.question;
      let position = 0;
      let mark = true;
      if (action == "上") {
        this.question.splice(index - 1, 1, ...arr.splice(index, 1, arr[index - 1]));
        position = index - 1;
      } else if (action == "下") {
        this.question.splice(index, 1, ...arr.splice(index + 1, 1, arr[index]));
        position = index + 1;
      } else if (action == "前") {
        this.question.unshift(arr.splice(index, 1)[0]);
        position = 0;
        mark = false;
      } else if (action == "后") {
        this.question.push(arr.splice(index, 1)[0]);
        position = this.question.length - 1;
        mark = false;
      }
      //判断是否调整了分页的位置
      if (this.question[position].currentPage) {
        if (mark) {
          if (this.question[index].currentPage) {
            let tmp = this.question[position].currentPage;
            this.question[position].currentPage = this.question[index].currentPage;
            this.question[index].currentPage = tmp;
          }
        } else {
          let page = 2;
          this.question.forEach((item) => {
            if (item.currentPage) {
              item.currentPage = page;
              page++;
            }
          });
        }
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
    //评分选项修改
    scoreOptionModify(index: number, num: number) {
      this.question[index].option = scoreOptionInit(num);
    },
  },
});
