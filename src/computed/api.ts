import storage from "@/utils/storage";
import type {
  surveyAnswerType,
  answerType,
  analysisType,
  analysisOptionType,
  fillType,
} from "@/types/index";
import { surveyStore } from "@/stores/survey";

const storeData = surveyStore();
/**
 * 获取数据分析
 * @param id 题目id
 */
export async function getAnalysisData(id: string):Promise<analysisType[]> {
  let answerData: surveyAnswerType[] = storage.getSession("ANSWERDATA", id);
  let survey = storeData.surveySelected(id);
  let answerList: answerType[] = [];
  answerData.forEach((item) => {
    answerList = answerList.concat(item.answer);
  });
  let data: analysisType[] = survey.question.map((item) => {
    let answerQuestion = answerList.filter((son) => son.questionId == item.id);
    let assessCount = answerQuestion.length;
    let option: analysisOptionType[] = item.option.map((son) => {
      let count = 0;
      let assess = item.type !== "多选" ? assessCount : 0;
      answerQuestion.forEach((answer) => {
        if (item.type == "单选") {
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
    if (item.type == "填空" && answerQuestion.length) {
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
  return data;
}
