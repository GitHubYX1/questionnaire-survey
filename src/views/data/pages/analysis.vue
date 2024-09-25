<template>
  <a-card class="analysis-list">
    <screen @screenData="screenData"></screen>
    <a-skeleton active :paragraph="{ rows: 10 }" :loading="loading">
      <div class="analysis-title">{{ titleText }}</div>
      <div class="analysis-column flex-between align-items" v-if="startTime">
        <div class="step-info">
          <span>答题时间：{{ startTime }} 到 {{ endTime }}</span>
          <span>测评量：{{ assessCount }}</span>
        </div>
        <a-button type="primary" :loading="downloadLoading" @click="exportclick">
          <template #icon>
            <DownloadOutlined />
          </template>
          进度报告
        </a-button>
      </div>
      <div class="analysis-item" v-for="item in topicData" :key="item.id">
        <template v-if="item.type !== typeEnum.PARAGRAPH">
          <div class="analysis-item-title">
            {{ item.title }} <span>[{{ item.type }}]</span>
          </div>
          <analysisTable v-if="onFill(item.type)" :tableData="item"></analysisTable>
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
import { processAnalysisData, onFill } from "@/computed/api";
import type { analysisType, answerType } from "@/types/index";
import analysisTable from "../components/analysis-table.vue";
import checkText from "../components/check-text.vue";
import screen from "../components/screen.vue";
import docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import JSZipUtils from "jszip-utils";
import { saveAs } from "file-saver";
import { typeEnum } from "@/assets/common/enums";

const storeData = surveyStore();

const loading = ref(true);
const titleText = ref("");
const assessCount = ref(0);
const topicData = ref<analysisType[]>([]);
const checkRef = ref<any>(null);
const startTime = ref<string>("");
const endTime = ref<string>("");
const downloadLoading = ref(false);
const date = ref(["", ""]);
const conditionValue = ref("and");
const screenAnswer = ref<answerType[]>([]);

const queryData = async () => {
  loading.value = true;
  let { title, count, start, end, data } = await processAnalysisData(storeData.surveyId, date.value, conditionValue.value, screenAnswer.value);
  titleText.value = title;
  assessCount.value = count;
  topicData.value = data;
  startTime.value = start;
  endTime.value = end;
  console.log("data", data);

  loading.value = false;
};

//查看填空题答案
const lookInfo = (item: analysisType) => {
  checkRef.value.open(item.title, item.fill);
};

//下载报告
const exportclick = () => {
  downloadLoading.value = true;
  let docxsrc = "data.docx"; //模板文件的位置
  console.log("topicData", topicData.value);
  let queryStepListData = topicData.value.map((item) => {
    let topicShow = true;
    let typeShow = true;
    if (item.type === typeEnum.PARAGRAPH) {
      topicShow = false;
      item.title = item.title.replace(/<[^>]+>/g, "");
    } else if (item.type === typeEnum.FILL) {
      typeShow = false;
    }
    return {
      topicShow,
      typeShow,
      title: item.title,
      type: item.type,
      option: item.option,
      assessCount: item.assessCount,
    };
  });
  const data = {
    form: {
      title: titleText.value,
    },
    list: queryStepListData,
  };
  // 读取并获得模板文件的二进制内容
  JSZipUtils.getBinaryContent(docxsrc, function (error: any, content: any) {
    // docxsrc是模板。我们在导出的时候，会根据此模板来导出对应的数据
    // 抛出异常
    if (error) {
      throw error;
    }
    // 创建一个PizZip实例，内容为模板的内容
    let zip = new PizZip(content);
    // 创建并加载docx templater实例对象
    let doc = new docxtemplater().loadZip(zip);
    // 设置模板变量的值
    doc.setData({
      ...data.form,
      list: data.list,
    });
    try {
      // 用模板变量的值替换所有模板变量
      doc.render();
    } catch (error: any) {
      // 抛出异常
      let e = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        properties: error.properties,
      };
      console.log(
        JSON.stringify({
          error: e,
        })
      );
      throw error;
    }
    // 生成一个代表docxtemplater对象的zip文件（不是一个真实的文件，而是在内存中的表示）
    let out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    // 将目标文件对象保存为目标类型的文件，并命名
    saveAs(out, titleText.value);
    downloadLoading.value = false;
  });
};

//筛选
const screenData = async (query: { date: string[], condition: string, answer: answerType[] }) => {
  date.value = query.date;
  conditionValue.value = query.condition;
  screenAnswer.value = query.answer;
  await queryData();
};

watch(
  () => storeData.surveyId,
  async () => {
    conditionValue.value = "and";
    screenAnswer.value = [];
    await queryData();
  },
  { immediate: true }
);
</script>
<style lang="scss" scoped>
.analysis-title {
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  padding: 15px 0;
}

.analysis-column {
  margin-bottom: 15px;
  font-size: 14px;

  .step-info {
    span {
      margin-right: 30px;
    }
  }
}

.analysis-item {
  margin-bottom: 15px;

  .analysis-item-title {
    font-size: 16px;
    margin-bottom: 10px;

    span {
      color: #a6a6a6;
      margin-left: 10px;
    }
  }

  .analysis-item-html {
    background: #f7f9fa;
    padding: 8px;
    border-radius: 5px;
  }

  :deep(.ant-progress-show-info .ant-progress-outer) {
    margin-right: calc(-2em - 30px);
    padding-right: calc(2em + 30px);
  }
}
</style>
