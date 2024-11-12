<template>
  <a-card class="answer-index">
    <screen @screenData="screenData"></screen>
    <div class="answer-operate flex-between">
      <span>问卷答案</span>
      <a-button v-if="answerData.length !== 0" type="primary" :loading="exportLoading" @click="download()">下载答案数据</a-button>
    </div>
    <a-table :dataSource="answerData" bordered rowKey="answerId" :pagination="answerData.length <= 10 ? false : true"
      :loading="loading">
      <a-table-column key="answerId" title="答卷编号" dataIndex="answerId" align="center"></a-table-column>
      <a-table-column key="answerId" title="开始时间" dataIndex="startTime" align="center"></a-table-column>
      <a-table-column key="answerId" title="结束时间" dataIndex="endTime" align="center"></a-table-column>
      <a-table-column key="answerId" title="答题用时" dataIndex="consumTime" align="center"></a-table-column>
      <a-table-column key="answerId" title="操作" align="center" width="100px">
        <template #default="{ record }">
          <div class="record-operate">
            <a-tooltip placement="bottom" title="查看详情">
              <eye-outlined @click="editClick(record.surveyId, record.answerId)" class="eye" />
            </a-tooltip>
            <a-tooltip placement="bottom" title="删除答卷">
              <a-popconfirm title="是否删除答卷？" ok-text="是" cancel-text="否"
                @confirm="courseDelete(record.surveyId, record.answerId)">
                <delete-outlined class="delete" />
              </a-popconfirm>
            </a-tooltip>
          </div>
        </template>
      </a-table-column>
    </a-table>
  </a-card>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { surveyStore } from "@/stores/survey";
import { processAnswerData } from "@/computed/api";
import type { surveyAnswerType, answerType } from "@/types/index";
import { answerErasure } from "@/computed/answer";
import screen from "../components/screen.vue";
import * as Excel from "exceljs";
import { saveAs } from "file-saver";

const router = useRouter();
const storeData = surveyStore();
const answerData = ref<surveyAnswerType[]>([]);
const excleData = ref<string[][]>([]);
const exeleQuestion = ref<string[][]>([]);
const date = ref(["", ""]);
const conditionValue = ref("and");
const screenAnswer = ref<answerType[]>([]);
const loading = ref(false);
const exportLoading = ref(false);

const getData = async () => {
  loading.value = true;
  let { answer, excleList, questionList } = await processAnswerData(storeData.surveyId, date.value, conditionValue.value, screenAnswer.value);
  answerData.value = answer;
  excleData.value = excleList;
  exeleQuestion.value = questionList;
  loading.value = false;
};

//查看
const editClick = (surveyId: string, answerId: string) => {
  let href = router.resolve({ path: "/preview", query: { id: surveyId, answerId: answerId } });
  window.open(href.href, "_blank");
};

//删除
const courseDelete = async (surveyId: string, answerId: string) => {
  answerErasure(surveyId, answerId);
  await getData();
};
//下载答案
const download = () => {
  exportLoading.value = true;
  const workbook = new Excel.Workbook();
  //数据详情
  const sheet = workbook.addWorksheet("数据详情");
  sheet.addRows(excleData.value);
  sheet.eachRow((row) => {
    //修改行
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      sheet.getColumn(colNumber).width = 20; // 设置列宽
      cell.alignment = { horizontal: "center" }; // 居中
    });
  });
  //题目列表
  const sheet2 = workbook.addWorksheet("题目列表");
  sheet2.addRows(exeleQuestion.value);
  sheet2.eachRow((row) => {
    //修改行
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      if(colNumber === 1){
        sheet2.getColumn(colNumber).width = 10;
      } else if(colNumber === 2){
        sheet2.getColumn(colNumber).width = 40;
      }else if(colNumber === 3){
        sheet2.getColumn(colNumber).width = 15;
      } else{
        sheet2.getColumn(colNumber).width = 30;
      }
      
      cell.alignment = { horizontal: "center" }; // 居中
    });
  });
  // 导出文档
  workbook.xlsx.writeBuffer().then((buffer) => {
    const data = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, answerData.value[0].surveyTitle + ".xlsx");
    exportLoading.value = false;
  });
};

//筛选
const screenData = async (query: { date: string[], condition: string, answer: answerType[] }) => {
  date.value = query.date;
  conditionValue.value = query.condition;
  screenAnswer.value = query.answer;
  await getData();
};

watch(
  () => storeData.surveyId,
  async () => {
    conditionValue.value = "and";
    screenAnswer.value = [];
    await getData();
  },
  { immediate: true }
);
</script>
<style lang="scss" scoped>
.answer-operate {
  margin: 15px 0;
  font-size: 16px;
}

.record-operate {
  font-size: 16px;

  .eye {
    cursor: pointer;

    &:hover {
      color: #1890ff;
    }
  }

  .delete {
    cursor: pointer;
    margin-left: 10px;

    &:hover {
      color: #ff4d4f;
    }
  }
}
</style>
