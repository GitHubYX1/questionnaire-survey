import cloneDeep from "lodash.clonedeep";
import storage from "@/utils/storage";
import type { surveyAnswerType, answerType, analysisType, analysisOptionType, fillType, questionType } from "@/types/index";
import { surveyStore } from "@/stores/survey";
import { typeEnum } from "@/assets/common/enums";
const { RADIO, CHECKBOX, DROP, SCORE, FILL, PAGING, SLIDER, MATRIX_RADIO, MATRIX_CHECKBOX, MATRIX_SLIDER } = typeEnum;
const optionKeyValue = [RADIO, DROP, SCORE, MATRIX_RADIO];
const infoTipes = [FILL, SLIDER, MATRIX_SLIDER];

export const onFill = (type: typeEnum) => {
  return !infoTipes.includes(type);
};

const storeData = surveyStore();

interface sliderObjType {
  [prop: string]: number;
}

/**
 * 答案筛选
 * @param answer 答案
 * @param condition 匹配条件
 * @param screenAnswer 筛选答案
 */
function answerFilter(answer: answerType[], condition: string, screenAnswer: answerType[]) {
  let matchCount = 0;
  if (screenAnswer.length) {
    for (const { questionId, content } of screenAnswer) {
      for (const item of answer) {
        if (item.questionId === questionId) {
          let itemMatched = false;
          const itemContent = item.content;
          if (Array.isArray(content)) {
            if (Array.isArray(itemContent)) {
              itemMatched = content.some(son => itemContent.includes(son));
            } else {
              itemMatched = content.includes(Number(itemContent));
            }
          } else {
            itemMatched = Array.isArray(itemContent) ? itemContent.includes(Number(content)) : String(itemContent) === String(content);
          }
          if (itemMatched) {
            matchCount++;
          }
          break;
        }
      }
    }
  }
  return screenAnswer.length ? (condition === "or" ? matchCount > 0 : matchCount === screenAnswer.length) : true;
}

/**
 * 获取答题数据
 * @param id 题目id
 * @param screenDate 时间范围
 * @param condition 匹配条件
 * @param screenAnswer 筛选答案
 */
function getAnswer(id: string, screenDate = [" ", " "], condition: string, screenAnswer: answerType[]) {
  let answerData: surveyAnswerType[] = storage.getSession("ANSWERDATA", id) || [];
  const dateTime = [new Date(screenDate[0]).getTime(), new Date(screenDate[1]).getTime()];
  answerData = answerData.filter(item => {
    const endTime = new Date(item.endTime).getTime();
    let dateSow = !screenDate[0] ? true : dateTime[0] <= endTime && dateTime[1] >= endTime;
    return dateSow && answerFilter(item.answer, condition, screenAnswer);
  });
  return answerData;
}

/**
 * 数据赛选
 * @param question 题目
 */
function dataCselection(question: questionType[]) {
  const questionList: questionType[] = [];
  for (const item of question) {
    if (item.type !== PAGING) {
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
  return questionList;
}

/**
 * 获取数据分析
 * @param id 题目id
 */
export async function processAnalysisData(
  id: string,
  screenDate = ["", ""],
  condition: string,
  screenAnswer: answerType[]
): Promise<{
  title: string;
  count: number;
  start: string;
  end: string;
  data: analysisType[];
}> {
  let answerData: surveyAnswerType[] = getAnswer(id, screenDate, condition, screenAnswer);
  let survey = storeData.surveySelected(id);
  let answerList: answerType[] = [];
  answerData.forEach(item => {
    answerList = answerList.concat(item.answer);
  });
  //获取开始到结束时间
  let start = "";
  let end = "";
  if (answerData.length) {
    start = answerData[answerData.length - 1].startTime.split(" ")[0];
    end = answerData[0].endTime.split(" ")[0];
  }
  const questionData = dataCselection(survey.question);
  //获取分析数据
  let data: analysisType[] = questionData.map(item => {
    let answerQuestion = answerList.filter(son => son.questionId == item.id);
    let assessCount = answerQuestion.length;
    let option: analysisOptionType[] = item.option.map(son => {
      let count = 0;
      let assess = item.type !== CHECKBOX && item.type !== MATRIX_CHECKBOX ? assessCount : 0;
      answerQuestion.forEach(answer => {
        if (item.type !== CHECKBOX && item.type !== MATRIX_CHECKBOX) {
          if (answer.content == son.id) {
            count += 1;
          }
        } else if (answer.content.constructor == Array) {
          assess += answer.content.length;
          for (let i in answer.content) {
            if (answer.content[i] == son.id) {
              count += 1;
            }
          }
        }
      });
      let ratio = count ? Number(((count / assess) * 100).toFixed(2)) : 0;
      return { ...son, count, ratio };
    });
    let fill: fillType[] = [];
    if (infoTipes.includes(item.type)) {
      fill = answerQuestion.map((son, index) => ({
        xh: index + 1,
        count: String(son.content),
      }));
    }
    return {
      id: item.id,
      title: item.title,
      type: item.type,
      option: option,
      fill: fill,
      assessCount: assessCount,
    };
  });
  return { title: survey.title, count: answerData.length, start, end, data };
}

/**
 * 答题数据
 * @param id 题目id
 */
export async function processAnswerData(id: string, screenDate = ["", ""], condition: string, screenAnswer: answerType[]): Promise<{ answer: surveyAnswerType[]; excleList: string[][],questionList:string[][] }> {
  let answer: surveyAnswerType[] = getAnswer(id, screenDate, condition, screenAnswer);
  let excleTop = ["答卷编号", "开始时间", "结束时间", "耗时"];
  let excleContent: string[][] = [];
  let survey = storeData.surveySelected(id);
  const questionData = dataCselection(cloneDeep(survey.question));
  
  answer.forEach((item, index) => {
    let answerContent = [item.answerId, item.startTime, item.endTime, item.consumTime];
    questionData.forEach(question => {
      if (index === 0 && question.type !== PAGING) {
        excleTop.push(question.id + "." + question.title);
      }
      //获取答题数据
      let content = item.answer.find(son => son.questionId == question.id)?.content;
      if (content && content.constructor == Array) {
        let textData = [];
        for (let i in content) {
          let id = content[i];
          let text = question.option.filter(option => option.id == id)[0].content;
          textData.push(id + "." + text);
        }
        answerContent.push(textData.join());
      } else if (content) {
        if (optionKeyValue.includes(question.type)) {
          let text = question.option.filter(option => option.id == content)[0].content;
          answerContent.push(content + "." + text);
        } else {
          answerContent.push(String(content));
        }
      } else if (question.type !== PAGING) {
        answerContent.push("");
      }
    });
    excleContent.push(answerContent);
  });
  //获取题目列表
  let questionList:string[][] = [["题目ID","标题","类型","选项","子题目"]];
  survey.question.forEach(item=>{
    let option = [],children=[];
    for(let son of item.option){
      option.push(`${son.id}~${son.content}`)
    }
    if(item.children && item.children.length){
      for(let son of item.children){
        children.push(`${son.id}~${son.title}`)
      }
    }
    questionList.push([String(item.id),item.title,item.type,option.join("|"),children.join("|")])
  })
  let excleList = [excleTop, ...excleContent];
  return { answer, excleList,questionList };
}
