import { inject } from "vue";
import { defineStore } from "pinia";
import { typeEnum, validateEnum } from "@/assets/common/enums";
import { mostValue, optionInit, scoreOptionInit, sliderInit } from "@/utils/index";
import type { optionType, questionType, surveyType, controlLogicType, loadingType, controlOptionType } from "@/types/index";
const { RADIO, CHECKBOX, DROP, SCORE, FILL, PAGING, SLIDER, MATRIX_RADIO, MATRIX_CHECKBOX, MATRIX_SLIDER } = typeEnum;
const serialRemoveType = [typeEnum.PARAGRAPH, typeEnum.PAGING];
const DEFAULT_QUESTIONNAIRE_TITLE = "测试问卷";
const INITIAL_QUESTION_MAX_ID = 1000;
const INSERT_NUM_DEFAULT = -2;
const EDIT_ID_DEFAULT = -1;
const BASE_MATRIX_TOPIC = ["外观", "功能"];
const MATRIX_TOPIC = [MATRIX_RADIO, MATRIX_CHECKBOX, MATRIX_SLIDER];

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
    title: DEFAULT_QUESTIONNAIRE_TITLE,
    content: "",
    createTime: "",
    modifyTime: "",
    state: false,
    question: [],
    controlLogic: [],
    controlOption: [],
    questionMaxId: INITIAL_QUESTION_MAX_ID,
    insertNum: INSERT_NUM_DEFAULT,
    editId: EDIT_ID_DEFAULT,
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
      this.question = [...survey.question];
      this.controlLogic = survey.controlLogic;
      this.controlOption = survey.controlOption || [];
      const totalPage = survey.question.filter(item => item.type === PAGING).length;
      this.totalPage = totalPage + 1;
      this.questionMaxId = maxId ? Number(maxId) : mostValue(survey.question, "id");
    },
    //清空
    reset() {
      this.id = "";
      this.title = DEFAULT_QUESTIONNAIRE_TITLE;
      this.content = "";
      this.createTime = "";
      this.modifyTime = "";
      this.state = false;
      this.question = [];
      this.controlLogic = [];
      this.controlOption = [];
      this.questionMaxId = INITIAL_QUESTION_MAX_ID;
      this.insertNum = INSERT_NUM_DEFAULT;
      this.editId = EDIT_ID_DEFAULT;
      this.totalPage = 1;
    },
    //打开编辑
    editCount(id: number) {
      this.editId = id;
    },
    //关闭编辑
    resetting() {
      document.getElementById("focal")?.focus();
      this.editId = EDIT_ID_DEFAULT;
    },
    //修改顶部标题
    titleModify(e: { title: string; content: string }) {
      this.title = e.title;
      this.content = e.content;
    },
    //获取控件
    deriveContrl(contrl: { title: string; type: typeEnum }) {
      const questionAdd: questionType = {
        id: this.questionMaxId,
        title: contrl.title,
        type: contrl.type,
        option: [],
        must: 1,
        column: 1,
        chooseMin: 0,
        chooseMax: 0,
        validateType: validateEnum.DEFAULT,
        children: [],
        isHide:0,
      };
      if ([RADIO, CHECKBOX, DROP, MATRIX_RADIO, MATRIX_CHECKBOX].includes(contrl.type)) {
        questionAdd.option = optionInit();
      } else if (contrl.type === SCORE) {
        questionAdd.option = scoreOptionInit(5);
      } else if (contrl.title === "简答题") {
        questionAdd.column = 2;
      } else if (contrl.type === PAGING) {
        this.totalPage++;
        questionAdd.currentPage = this.totalPage;
        questionAdd.must = 0;
      } else if (contrl.type === SLIDER || contrl.type === MATRIX_SLIDER) {
        questionAdd.option = sliderInit();
      }
      if (MATRIX_TOPIC.includes(contrl.type)) {
        for (const item of BASE_MATRIX_TOPIC) {
          this.questionMaxId += 1;
          const childrenItem = { ...questionAdd, id: this.questionMaxId, title: item };

          if (!questionAdd.children) {
            questionAdd.children = [childrenItem];
          } else {
            questionAdd.children.push(childrenItem);
          }
        }
      }
      if (this.insertNum === INSERT_NUM_DEFAULT) {
        this.question.push(questionAdd);
      } else {
        this.question.splice(this.insertNum + 1, 0, questionAdd);
        this.insertNum = INSERT_NUM_DEFAULT;
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
        question.forEach(item => {
          if (item.type === PAGING) {
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
      if (this.question[index].type === PAGING) {
        this.totalPage--;
        this.question.forEach((item, sonIndex) => {
          if (item.currentPage && sonIndex > index) {
            item.currentPage--;
          }
        });
      }
      this.controlLogic = this.controlLogic.filter(item => item.childId !== id && !item.questionIds.includes(String(id)));
      this.controlOption = this.controlOption.filter(item => item.childId !== id && !item.questionIds.includes(String(id)));
      this.question.splice(index, 1);
      this.resetting();
    },
    //移动
    move(index: number, action: string) {
      let arr = this.question;
      let position = 0;
      let mark = true;
      if (action === "上") {
        if (index > 0) {
          this.question.splice(index - 1, 1, ...arr.splice(index, 1, arr[index - 1]));
          position = index - 1;
        }
      } else if (action === "下") {
        if (index < this.question.length - 1) {
          this.question.splice(index, 1, ...arr.splice(index + 1, 1, arr[index]));
          position = index + 1;
        }
      } else if (action === "前") {
        if (index > 0) {
          this.question.unshift(arr.splice(index, 1)[0]);
          position = 0;
          mark = false;
        }
      } else if (action === "后") {
        if (index < this.question.length - 1) {
          this.question.push(arr.splice(index, 1)[0]);
          position = this.question.length - 1;
          mark = false;
        }
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
          this.question.forEach(item => {
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
    mustSelect(index: number, must: 0 | 1) {
      this.question[index].must = must;
    },
    //类型修改
    typeModify(index: number, type: typeEnum, id = -1) {
      let option: optionType[] = [];
      if (this.question[index].type === FILL && type !== FILL) {
        option = optionInit();
      } else if (type === FILL) {
        option = [];
        this.question[index].column = 1;
      } else if (type === MATRIX_SLIDER) {
        option = sliderInit();
      } else if (this.question[index].type === MATRIX_SLIDER) {
        option = optionInit();
      } else {
        option = this.question[index].option;
      }
      this.question[index].option = option;
      this.question[index].type = type;
      const children = this.question[index].children;
      if (children && children.length) {
        children.forEach(item => {
          item.option = option;
          item.type = type;
        });
        this.question[index].children = children;
      }
      if (id !== -1) {
        this.controlLogic = this.controlLogic.filter(item => item.childId !== id && !item.questionIds.includes(String(id)));
        this.controlOption = this.controlOption.filter(item => item.childId !== id && !item.questionIds.includes(String(id)));
      }
    },
    //添加
    optionAdd(index: number, optionIndex: number) {
      const optionData: optionType[] = this.question[index].option.concat();
      const id = mostValue(optionData, "id");
      const options: optionType = { id, content: "选项" + id };
      if (optionIndex == -1) {
        optionData.push(options);
      } else {
        optionData.splice(optionIndex + 1, 0, options);
      }
      this.question[index].option = optionData;
      const children = this.question[index].children;
      if (children && children.length) {
        children.forEach(item => {
          item.option = optionData;
        });
        this.question[index].children = children;
      }
    },
    //批量添加
    optionBatchAdd(e: { index: number; optionText: string }) {
      const id = this.question[e.index].id;
      let option: optionType[] = e.optionText.split("\n").map((item, index) => ({ id: index + 1, content: item }));
      this.question[e.index].option = option;
      this.controlLogic = this.controlLogic.filter(item => !item.questionIds.includes(String(id)));
      this.controlOption = this.controlOption.filter(item => item.childId !== id && !item.questionIds.includes(String(id)));
    },
    //选项移除
    optionRemove(index: number, optionIndex: number, optionId = -1) {
      const id = this.question[index].id;
      let arr = this.question[index].option.concat();
      arr.splice(optionIndex, 1);
      this.question[index].option = arr;
      const children = this.question[index].children;
      if (children && children.length) {
        children.forEach(item => {
          item.option = arr;
        });
        this.question[index].children = children;
      }
      if (optionId !== -1) {
        this.controlLogic = this.controlLogic.filter(item => {
          item = this.processItem(item, id, optionId);
          return item.questionIds !== "";
        });
        this.controlOption = this.controlOption.filter(item => {
          if (item.childId === id && item.optionId === optionId) return false;
          item = this.processItem(item, id, optionId);
          return item.questionIds !== "";
        });
      }
    },
    // 关联项筛选
    processItem(item: controlLogicType, id: number, optionId: number) {
      const questionIdsArray = [...item.questionIds.split(",")];
      const idIndex = questionIdsArray.indexOf(String(id));
      if (idIndex !== -1) {
        let answerArray = [...item.parentAnswer.split("|")];
        answerArray[idIndex] = answerArray[idIndex]
          .split(",")
          .filter((son: string) => son !== String(optionId))
          .join(",");
        if (answerArray[idIndex] === "") {
          questionIdsArray.splice(idIndex, 1);
          answerArray.splice(idIndex, 1);
          item.questionIds = questionIdsArray.join(",");
        }
        item.parentAnswer = answerArray.join("|");
      }
      return item;
    },
    //选项移动
    optionMove(index: number, optionIndex: number, action: string) {
      let arr = this.question[index].option.concat();
      if (action === "上") {
        if (optionIndex > 0) arr.splice(optionIndex - 1, 1, ...arr.splice(optionIndex, 1, arr[optionIndex - 1]));
      } else if (action === "下") {
        if (optionIndex < arr.length - 1) arr.splice(optionIndex, 1, ...arr.splice(optionIndex + 1, 1, arr[optionIndex]));
      }
      this.question[index].option = arr;
      const children = this.question[index].children;
      if (children && children.length) {
        children.forEach(item => {
          item.option = arr;
        });
        this.question[index].children = children;
      }
    },
    //获取向前关联
    getFront(front: controlLogicType) {
      if (!front.parentAnswer) {
        return (this.controlLogic = this.controlLogic.filter(item => item.childId !== front.childId));
      }
      let index = this.controlLogic.findIndex(item => item.childId === front.childId);
      if (index === -1) {
        this.controlLogic.push(front);
      } else {
        this.controlLogic[index] = front;
      }
    },
    //复制关联
    getCopy(e: { id: number; childId: number[]; data: controlLogicType[] }) {
      if (e.childId.length != 0) {
        this.controlLogic = this.controlLogic.filter(item => !e.childId.includes(item.childId));
        this.controlLogic = this.controlLogic.concat(e.data);
      }
    },
    //评分选项修改
    scoreOptionModify(index: number, num: number) {
      this.question[index].option = scoreOptionInit(num);
    },
    //获取序号
    serialNum(id: number, parent: string[] = []) {
      let num = 0;
      let answer: number[] = [];
      for (const data of this.question) {
        if (!serialRemoveType.includes(data.type)) num++;
        if (data.id === id) {
          if (parent.length !== 0) {
            answer = parent.map(id => data.option.findIndex(opt => String(opt.id) === id) + 1);
          }
          return { num, answer };
        }
      }
      return { num, answer };
    },
    //获取逻辑文本
    logicText(controlLogic: controlLogicType | undefined) {
      if (!controlLogic) return "";
      const questionIds = controlLogic.questionIds.split(",").map(item => Number(item));
      const parentAnswer = controlLogic.parentAnswer.split("|");
      let str = "依赖于";
      str += questionIds
        .map((qid, index) => {
          const { num, answer } = this.serialNum(qid, parentAnswer[index].split(","));
          return { num: num, text: `第${num}题第${answer.sort().join("、")}选项，` };
        })
        .sort(function (a, b) {
          return a.num - b.num;
        })
        .map(item => item.text)
        .join("");
      if (questionIds.length > 1) {
        str += `为“${controlLogic.condition === "and" ? "且" : "或"}”的关系`;
      } else {
        str = str.slice(0, -1);
      }
      return str;
    },
    // 获取选项关联
    getControlOption(optionLogic: controlOptionType) {
      this.controlOption = this.controlOption.filter(item => item.childId !== optionLogic.questionId).concat(optionLogic.control);
    },
    // 滑动条修改
    sliderModify(index: number, optionIndex: number, value: number) {
      this.question[index].option[optionIndex].id = value;
      const children = this.question[index].children;
      if (children && children.length) {
        children.forEach(item => {
          item.option[optionIndex].id = value;
        });
        this.question[index].children = children;
      }
    },
    // 添加行
    addRows(index: number, rowsIndex: number, length: number) {
      const children = this.question[index].children;
      if (children) {
        const questionChildren = { ...this.question[index], id: this.questionMaxId, children: [], title: "选项" + length };
        this.questionMaxId += 1;
        if (rowsIndex === -1) {
          children.push(questionChildren);
        } else {
          children.splice(rowsIndex + 1, 0, questionChildren);
        }
        this.question[index].children = children;
      }
    },
    //删除行
    removeRows(index: number, rowsIndex: number) {
      const children = this.question[index].children;
      if (children) {
        children.splice(rowsIndex, 1);
        this.question[index].children = children;
      }
    },
    //移动行
    moveRows(index: number, rowsIndex: number, action: string) {
      let arr = this.question[index].children?.concat();
      if (arr) {
        if (action === "上") {
          if (rowsIndex > 0) arr.splice(rowsIndex - 1, 1, ...arr.splice(rowsIndex, 1, arr[rowsIndex - 1]));
        } else if (action === "下") {
          if (rowsIndex < arr.length - 1) arr.splice(rowsIndex, 1, ...arr.splice(rowsIndex + 1, 1, arr[rowsIndex]));
        }
        this.question[index].children = arr;
      }
    },
    //隐藏题目
    whetherHide(index:number,isHide:0|1){
      if(isHide === 1){
        isHide = 0;
      }else{
        isHide = 1;
      }
      this.question[index].isHide = isHide;
    }
  },
});
