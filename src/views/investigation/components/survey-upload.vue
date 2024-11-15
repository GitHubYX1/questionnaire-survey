<template>
  <a-modal :visible="fileVisible" title="问卷导入" @cancel="onCancel" @ok="handleOk" :confirmLoading="loading">
    <div class="upload-box">
      <div class="upload-file">
        <a-button type="primary">
          <upload-outlined></upload-outlined>
          文件上传
          <input type="file" class="upload-input" ref="fileInput" @change="importFile($event)" accept=".xlsx,.xls" />
        </a-button>
        <span>{{ uploadText }}</span>
      </div>
      <a-radio-group v-model:value="uploadRadio">
        <a-radio class="editor-option" value="create">创建问卷</a-radio>
        <a-radio class="editor-option" value="add">追加问卷</a-radio>
      </a-radio-group>
      <div class="upload-error">{{ errorText }}</div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import Excel from "exceljs";
import type { questionType } from "@/types/index";
import { typeEnum, validateEnum } from "@/assets/common/enums";
import { scoreOptionInit } from "@/utils";
import { isValidNumber } from "@/utils/isValidType"
import { message } from "ant-design-vue";

interface xlsxObjType {
  [prop: string]: any;
}

const { RADIO, CHECKBOX, DROP, SCORE, FILL, PAGING, PARAGRAPH, SLIDER, MATRIX_RADIO, MATRIX_CHECKBOX, MATRIX_SLIDER } = typeEnum;
const typeList = [RADIO, CHECKBOX, DROP, SCORE, FILL, PAGING, PARAGRAPH, SLIDER, MATRIX_RADIO, MATRIX_CHECKBOX, MATRIX_SLIDER];
const oNOption = [FILL, PAGING, PARAGRAPH];
const MATRIX_TOPIC = [MATRIX_RADIO, MATRIX_CHECKBOX, MATRIX_SLIDER];

const props = defineProps({
  questionMaxId: {
    type: Number,
    default: 1000,
  },
});

const emit = defineEmits(["upload"]);
const fileInput = ref<any>({ value: "" })

const fileVisible = ref(false);
const loading = ref(false);
const uploadText = ref("");
const uploadRadio = ref("create");
const errorText = ref("");
const questionData = ref<questionType[]>([])

// 打开
const uploadOpen = () => {
  fileVisible.value = true;
  uploadText.value = "";
  errorText.value = "";
  questionData.value = [];
  fileInput.value.value = "";//清空输入框内容
  console.log('typeList', typeList);
};

//取消
const onCancel = (e: any) => {
  if (e.target.className != "ant-modal-wrap") fileVisible.value = false;
};

// 错误文本初始化
const errorTextInit = (text: string) => {
  errorText.value = text;
  loading.value = false;
};

//文件导入
const importFile = async (event: any) => {
  loading.value = true;
  const file = event.target.files[0];
  //创建workbook
  const workbook = new Excel.Workbook();
  //异步读取存储在用户计算机上的文件（或原始数据缓冲区）的内容
  const reader = new FileReader();
  reader.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    //解析文件流
    workbook.xlsx.load(data).then(async () => {
      const worksheet = workbook.getWorksheet(1);
      const jsonData: xlsxObjType[] = [];
      worksheet?.eachRow((row, rowNumber) => {
        if (rowNumber !== 1) {
          // 忽略标题行
          const rowData: xlsxObjType = {};
          row.eachCell((cell, colNumber) => {
            rowData[String(worksheet.getCell(1, colNumber).value)] = cell.value;
          });
          jsonData.push(rowData);
        }
      });
      console.log("打印jsonData", jsonData);
      try {
        // 获取题目列表
        const questionList = await processQuestionData(jsonData);
        errorText.value = "";
        uploadText.value = file.name;
        questionData.value = questionList
        console.log('questionList', questionList);
        loading.value = false;
      } catch (error: any) {
        errorTextInit(error);
      }
    }).catch((res) => {
      errorTextInit("上传文件有问题！");
      console.error(res);
    });
  };
  reader.readAsArrayBuffer(file);
};

// 新增的函数，处理数据并验证
async function processQuestionData(data: xlsxObjType[]) {
  const questions: questionType[] = [];
  let id = Number(props.questionMaxId);
  for (let i = 0; i < data.length; i++) {
    const index = i + 1;
    const rowData = data[i];
    if (rowData["类型"] == PAGING) rowData["标题"] = PAGING;
    else if (!rowData["标题"]) throw `第${index}题目标题未填写！`;
    if (!rowData["类型"]) throw `第${index}题目类型未填写！`;
    if (!typeList.includes(rowData["类型"])) throw `第${index}题目类型错误！`;
    let option = rowData["选项"] ? rowData["选项"].split("|").map((item: string) => {
      let data = item.split("~");
      return {
        id: Number(data[0]),
        content: data[1],
      };
    }) : [];
    if (!oNOption.includes(rowData["类型"]) && option.length === 0) throw `第${index}题目选项未填写！`;
    // 检查选项序号重复
    const idSet = new Set(option.map(({ id }: { id: number }) => id));
    if (option.length !== idSet.size) throw `第${index}题目选项序号有重复！`;
    if (rowData["类型"] === SCORE) {
      if (option.length > 10) throw `第${index}题目评分选项不能超过10个！`;
      option = scoreOptionInit(option.length);
    } else if (rowData["类型"] === SLIDER || rowData["类型"] === MATRIX_SLIDER) {
      if (option.length !== 2) throw `第${index}题目滑动条选必须是2个！`;
      if (option[0].id > option[1].id) throw `第${index}题目滑动条最小值不能大于最大值！`;
      if (!isValidNumber(option[0].id) || !isValidNumber(option[1].id)) throw `第${index}题目滑动条序号范围应当是0~100！`;
    }
    const json: questionType = {
      id,
      title: rowData["标题"],
      type: rowData["类型"],
      option,
      must: rowData["必答题"] === "是" ? 1 : 0,
      column: 1,
      chooseMin: 0,
      chooseMax: 0,
      validateType: validateEnum.DEFAULT,
      children: [],
      isHide: 0,
    }
    if (MATRIX_TOPIC.includes(rowData["类型"])) {
      if (!rowData["子问题"]) throw `第${index}矩阵题子问题未填写！`;
      if (json.option.length > 5) throw `第${index}矩阵题选项不能超过5个！`;
      json.children = rowData["子问题"].split("|").map((item: string) => {
        id++;
        return {
          ...json,
          id,
          title: item,
          children: [],
        }
      })
    }
    questions.push(json);
    id++;
  }
  return questions;
}

// 上传questionData数据
const handleOk = () => {
  if (questionData.value.length === 0) return message.info("请选择要上传的文件！");
  fileVisible.value = false;
  emit("upload", { question: questionData.value, radio: uploadRadio.value });
};

defineExpose({ uploadOpen });
</script>
<style lang="scss" scoped>
.upload-file {
  width: 100%;
  border: 1px solid #cccccc;
  border-radius: 5px;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .ant-btn {
    margin-right: 10px;
  }
}

.upload-error {
  line-height: 30px;
  font-size: 16px;
  color: red;
}

.upload-input {
  width: 100%;
  height: 100%;
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
  cursor: pointer;
}
</style>
