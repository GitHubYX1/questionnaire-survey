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

const { RADIO, CHECKBOX, DROP, SCORE, FILL, PAGING, PARAGRAPH, SLIDER } = typeEnum;
const typeList = [RADIO, CHECKBOX, DROP, SCORE, FILL, PAGING, PARAGRAPH, SLIDER];
const oNOption = [FILL, PAGING, PARAGRAPH];

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
  let id = Number(props.questionMaxId);
  const file = event.target.files[0];
  //创建workbook
  const workbook = new Excel.Workbook();
  //异步读取存储在用户计算机上的文件（或原始数据缓冲区）的内容
  const reader = new FileReader();
  reader.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    //解析文件流
    workbook.xlsx.load(data).then(() => {
      const worksheet = workbook.getWorksheet(1);
      const jsonData: any = [];
      worksheet?.eachRow((row, rowNumber) => {
        if (rowNumber !== 1) {
          // 忽略标题行
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            rowData[String(worksheet.getCell(1, colNumber).value)] =
              cell.value;
          });
          jsonData.push(rowData);
        }
      });
      console.log("打印jsonData", jsonData);
      //获取题目
      let questionList: questionType[] = [];
      for (let i = 0; i < jsonData.length; i++) {
        let index = i + 1;
        if (jsonData[i]["类型"] == typeEnum.PAGING) {
          jsonData[i]["标题"] = typeEnum.PAGING;
        } else if (!jsonData[i]["标题"]) {
          return errorTextInit(`第${index}题目标题未填写！`);
        } else if (!jsonData[i]["类型"]) {
          return errorTextInit(`第${index}题目类型未填写！`); 
        } else if (!typeList.includes(jsonData[i]["类型"])) {
          return errorTextInit(`第${index}题目类型错误！`);
        }
        let idList: number[] = [];
        let option = jsonData[i]["选项"] ? jsonData[i]["选项"].split("|").map((item: string) => {
          let data = item.split("~");
          idList.push(Number(data[0]))
          return {
            id: Number(data[0]),
            content: data[1],
          };
        }) : [];
        if (!oNOption.includes(jsonData[i]["类型"]) && option.length === 0) {
          return errorTextInit(`第${index}题目选项未填写！`);
        }
        //选项序号重复判断
        const idSet = new Set(idList);
        if (option.length && option.length !== idSet.size) {
          return errorTextInit(`第${index}题目选项序号有重复！`);
        }
        if (jsonData[i]["类型"] === typeEnum.SCORE) {
          if (option.length > 10) {
            return errorTextInit(`第${index}题目评分选项不能超过10个！`);
          }
          option = scoreOptionInit(option.length)
        } else if (jsonData[i]["类型"] === SLIDER) {
          if (option.length !== 2) {
            return errorTextInit(`第${index}题目滑动条选必须是2个！`);
          } else if (option[0].id > option[1].id) {
            return errorTextInit(`第${index}题目滑动条最大值不能小于最小值！`);
          } else if (!isValidNumber(option[0].id) || !isValidNumber(option[1].id)) {
            return errorTextInit(`第${index}题目滑动条序号范围应当是0~100！`);
          }
        }
        questionList.push({
          id: id,
          title: jsonData[i]["标题"],
          type: jsonData[i]["类型"],
          option: option,
          must: jsonData[i]["必答题"] === "是" ? 1 : 0,
          column: 1,
          chooseMin: 0,
          chooseMax: 0,
          validateType: validateEnum.DEFAULT,
        });
        id++;
      }
      errorText.value = "";
      uploadText.value = file.name;
      questionData.value = questionList
      console.log('questionList', questionList);
      loading.value = false;
    }).catch((res) => {
      errorTextInit("上传文件有问题！");
      console.error(res);
    });
  };
  reader.readAsArrayBuffer(file);
};

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
