<template>
  <a-card class="analysis-list">
    <a-skeleton active :paragraph="{ rows: 10 }" :loading="loading">
      <div class="analysis-title">{{ titleText }}</div>
      <div class="analysis-item" v-for="item in topicData" :key="item.id">
        <template v-if="item.type !== '段落说明'">
          <div class="analysis-item-title">{{ item.title }} <span>[{{ item.type }}]</span></div>
          <analysisTable v-if="item.type !== '填空'" :tableData="item"></analysisTable>
          <a-button v-else type="primary" @click="lookInfo(item)">详细作答情况</a-button>
        </template>
        <div v-else class="analysis-item-html" v-html="item.title"></div>
      </div>
    </a-skeleton>
  
    <check-text ref="checkRef"></check-text>
  </a-card>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { surveyStore } from "@/stores/survey";
import { getAnalysisData } from "@/computed/api";
import type { analysisType } from "@/types/index";
import analysisTable from "../components/analysis-table.vue";
import checkText from "../components/check-text.vue";

const storeData = surveyStore();

const loading = ref(true);
const titleText = ref("");
const assessCount = ref(0);
const topicData = ref<analysisType[]>([]);
const checkRef = ref<any>(null);

const queryData = async () => {
  loading.value = true;
  let { title, count, data } = await getAnalysisData(storeData.surveyId);
  titleText.value = title;
  assessCount.value = count;
  topicData.value = data;
  console.log("data", data);

  loading.value = false;
}

//查看填空题答案
const lookInfo = (item:analysisType) =>{
  checkRef.value.open(item.title,item.fill);
}

watch(() => storeData.surveyId, async () => {
  await queryData()
}, { immediate: true })
</script>
<style lang="scss" scoped>
.analysis-title {
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  padding: 15px 0;
}

.analysis-item {
  margin-bottom: 15px;

  .analysis-item-title {
    font-size: 16px;
    margin-bottom: 10px;

    span {
      color: #A6A6A6;
      margin-left: 10px;
    }
  }

  .analysis-item-html {
    background: #F7F9FA;
    padding: 8px;
    border-radius: 5px;
  }
}</style>