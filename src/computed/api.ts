import storage from "@/utils/storage";
import type { surveyAnswerType, answerType, analysisType, analysisOptionType, fillType, questionType } from "@/types/index";
import { surveyStore } from "@/stores/survey";
import { typeEnum } from "@/assets/common/enums";
const { RADIO, CHECKBOX, FILL, PAGING, SLIDER, MATRIX_SLIDER } = typeEnum;

const storeData = surveyStore();

interface sliderObjType {
  [prop: string]: number;
}

/**
 * 获取答题数据
 * @param id 题目id
 * @param screenDate 时间范围
 */
function getAnswer(id: string, screenDate = ["", ""]) {
  let answerData: surveyAnswerType[] = storage.getSession("ANSWERDATA", id) || [];
  if (screenDate[0]) {
    const dateTime = [new Date(screenDate[0]).getTime(), new Date(screenDate[1]).getTime()];
    answerData = answerData.filter((item) => {
      const endTime = new Date(item.endTime).getTime();
      return dateTime[0] <= endTime && dateTime[1] >= endTime;
    });
  }
  return answerData;
}

/**
 * 滑动条选项
 * @param answerQuestion 答题选项
 * @param assessCount 选项数量
 */
function sliderOption(answerQuestion: answerType[], assessCount: number): analysisOptionType[] {
  let sliderObj: sliderObjType = {};
  let option: analysisOptionType[] = [];
  answerQuestion.forEach((item) => {
    const key = String(item.content);
    sliderObj[key] = (sliderObj[key] || 0) + 1;
  });
  for (const i in sliderObj) {
    option.push({
      id: Number(i),
      content: i,
      count: sliderObj[i],
      ratio: Number(((sliderObj[i] / assessCount) * 100).toFixed(2)),
    });
  }
  return option;
}

/**
 * 数据赛选
 * @param question 题目
 */
function dataCselection(question: questionType[]){
  const questionList:questionType[] = [];
  for(const item of question){
    if(item.type !== PAGING){
      if(item.children.length){
        for(const child of item.children){
          child.title = item.title + "-" + child.title;
          questionList.push(child);
        }
      }else{
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
  screenDate = ["", ""]
): Promise<{
  title: string;
  count: number;
  start: string;
  end: string;
  data: analysisType[];
}> {
  let answerData: surveyAnswerType[] = getAnswer(id, screenDate);
  let survey = storeData.surveySelected(id);
  let answerList: answerType[] = [];
  answerData.forEach((item) => {
    answerList = answerList.concat(item.answer);
  });
  //获取开始到结束时间
  let start = "";
  let end = "";
  if (answerData.length) {
    start = answerData[answerData.length - 1].startTime.split(" ")[0];
    end = answerData[0].endTime.split(" ")[0];
  }
  console.log("survey.question",survey.question)
  const questionData = dataCselection(survey.question);
  //获取分析数据
  let data: analysisType[] = questionData
    .map((item) => {
      let answerQuestion = answerList.filter((son) => son.questionId == item.id);
      let assessCount = answerQuestion.length;
      let option: analysisOptionType[] =
        item.type !== SLIDER && item.type !== MATRIX_SLIDER
          ? item.option.map((son) => {
              let count = 0;
              let assess = item.type !== CHECKBOX ? assessCount : 0;
              answerQuestion.forEach((answer) => {
                if (item.type !== CHECKBOX) {
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
            })
          : sliderOption(answerQuestion, assessCount);
      let fill: fillType[] = [];
      if (item.type == FILL && answerQuestion.length) {
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
    })
  return { title: survey.title, count: answerData.length, start, end, data };
}

/**
 * 答题数据
 * @param id 题目id
 */
export async function processAnswerData(id: string, screenDate = ["", ""]): Promise<{ answer: surveyAnswerType[]; excleList: string[][] }> {
  let answer: surveyAnswerType[] = getAnswer(id, screenDate);
  let excleTop = ["答卷编号", "开始时间", "结束时间", "耗时"];
  let excleContent: string[][] = [];
  let survey = storeData.surveySelected(id);
  const questionData = dataCselection(survey.question);
  answer.forEach((item, index) => {
    let answerContent = [item.answerId, item.startTime, item.endTime, item.consumTime];
    questionData.forEach((question) => {
      if (index === 0 && question.type !== PAGING) {
        excleTop.push(question.id + "." + question.title);
      }
      //获取答题数据
      let content = item.answer.find((son) => son.questionId == question.id)?.content;
      if (content && content.constructor == Array) {
        let textData = [];
        for (let i in content) {
          let id = content[i];
          let text = question.option.filter((option) => option.id == id)[0].content;
          textData.push(id + "." + text);
        }
        answerContent.push(textData.join());
      } else if (content) {
        if (question.type === RADIO) {
          let text = question.option.filter((option) => option.id == content)[0].content;
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
  let excleList = [excleTop, ...excleContent];
  return { answer, excleList };
}
