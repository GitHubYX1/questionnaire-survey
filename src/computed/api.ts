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
export async function getAnalysisData(
  id: string
): Promise<{ title: string; count: number; data: analysisType[] }> {
  let answerData: surveyAnswerType[] = storage.getSession("ANSWERDATA", id) || [];
  let survey = storeData.surveySelected(id);
  let answerList: answerType[] = [];
  answerData.forEach((item) => {
    answerList = answerList.concat(item.answer);
  });
  //获取分析数据
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
  return { title: survey.title, count: answerData.length, data };
}

/**
 * 答题数据
 * @param id 题目id
 */
export async function getAnswerData(id: string): Promise<{ answer: surveyAnswerType[]; excleList: string[][] }> {
  let answer: surveyAnswerType[] = storage.getSession("ANSWERDATA", id) || [];
  let excleTop = ["答卷编号", "开始时间", "结束时间", "耗时"];
  let excleContent: string[][] = [];
  let survey = storeData.surveySelected(id);
  answer.forEach((item, index) => {
    let answerContent = [ item.answerId, item.startTime, item.endTime, item.consumTime ];
    survey.question.forEach((question) => {
      if (index == 0) {
        excleTop.push(question.id + "." + question.title);
      }
      //获取答题数据
      let content = item.answer.find((answer) => answer.questionId == question.id)?.content;
      if (content && content.constructor == Array) {
        let textData = [];
        for (let i in content) {
          let id = content[i];
          let text = question.option.filter((option) => option.id == id)[0].content;
          textData.push(id + "." + text);
        }
        answerContent.push(textData.join());
      } else if (content) {
        if (question.type === "单选") {
          let text = question.option.filter((option) => option.id == content)[0].content;
          answerContent.push(content + "." + text);
        } else {
          answerContent.push(String(content));
        }
      } else {
        answerContent.push("");
      }
    });
    excleContent.push(answerContent);
  });
  let excleList = [excleTop, ...excleContent];
  return { answer, excleList };
}
