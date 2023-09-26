import storage from "@/utils/storage";
import type { surveyAnswerType } from "@/types/index";

/**答案保存*/
export function answerSave(answer: surveyAnswerType) {
  if (!storage.getSession("ANSWERDATA")) storage.setSession("ANSWERDATA", {});
  let answerData = storage.getSession("ANSWERDATA", answer.surveyId) || [];
  answerData.unshift(answer);
  storage.setSession("ANSWERDATA", answerData, answer.surveyId);
}

/**答案删除*/
export function answerErasure(id: string,answerId?:string) {
  if(!answerId){
    storage.subKeyDelete("ANSWERDATA", id);
  }else{
    let answerData = storage.getSession("ANSWERDATA", id);
    answerData = answerData.filter((item:surveyAnswerType) => item.answerId !== answerId);
    storage.setSession("ANSWERDATA", answerData,id);
  }
}

/**获取答案*/
export function answerSelected(id:string,answerId:string):surveyAnswerType{
  let answerData = storage.getSession("ANSWERDATA", id);
  return answerData.filter((item:any) => item.answerId === answerId)[0];
}

/**获取答案次数*/
export function getAnswerNum(id: string): number {
  let num = 0;
  if (id == "add") {
    let answerData = storage.getSession("ANSWERDATA");
    for (let i in answerData) {
      num += answerData[i].length;
    }
  } else {
    num = storage.getSession("ANSWERDATA", id)?.length || 0;
  }
  return num;
}

/**获取所有答题*/
export function getAnswerData() {
  let answerData = storage.getSession("ANSWERDATA");
  let data: surveyAnswerType[] = []
  for (let i in answerData) {
    data = [...data,...answerData[i]]
  }
  return data
}