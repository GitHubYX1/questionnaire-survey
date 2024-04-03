import { ref } from "vue";
import { defineStore } from "pinia";
import cloneDeep from "lodash.clonedeep";
import type { surveyType } from "@/types/index";
import storage from "@/utils/storage";

export const surveyStore = defineStore("storeData", () => {
  const surveyData = ref<surveyType[]>(storage.getSession("SURVEYDATA") || []);
  const surveyId = ref<string>(localStorage.getItem("SURVEYID") || "");
  /**获取调查*/
  function surveySelected(id: string): surveyType {
    return cloneDeep(surveyData.value.filter((item) => item.id === id)[0]);
  }
  /**新增调查*/
  function surveyAdd(survey: surveyType) {
    surveyData.value.unshift(survey);
    storage.setSession("SURVEYDATA", surveyData.value);
  }
  /**调查修改*/
  function surveyModify(survey: surveyType) {
    let index = surveyData.value.findIndex((item) => {
      return item.id === survey.id;
    });
    surveyData.value[index] = survey;
    storage.setSession("SURVEYDATA", surveyData.value);
  }
  /**状态修改*/
  function stateModify(id: string, state: boolean) {
    surveyData.value.forEach((item) => {
      if (item.id == id) item.state = state;
    });
    storage.setSession("SURVEYDATA", surveyData.value);
  }
  /**调查删除*/
  function surveyErasure(id: string) {
    surveyData.value = surveyData.value.filter((item) => item.id !== id);
    storage.setSession("SURVEYDATA", surveyData.value);
  }
  function modifySurveyId(id: string) {
    surveyId.value = id;
    localStorage.setItem("SURVEYID", id);
  }
  return {
    surveyData,
    surveySelected,
    surveyAdd,
    surveyModify,
    stateModify,
    surveyErasure,
    surveyId,
    modifySurveyId,
  };
});
