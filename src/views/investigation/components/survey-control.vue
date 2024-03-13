<template>
  <div class="control-nav">
    <div class="control-box" v-for="item in contrlData" :key="item.key">
      <div class="control-title">{{ item.title }}</div>
      <div class="control-list flex-between flex-wrap">
        <div class="control-item" v-for="children in item.children" :key="children.key" @click="clickControl(children)">
          <component :is="children.icon"></component>
          {{ children.title }}
        </div>
      </div>
    </div>
    <a-button type="primary" block size="large" @click="download">下载导入问卷模板</a-button>
    <a-button type="primary" block size="large" @click="uploadRef.uploadOpen()">导入问卷</a-button>
    <survey-upload ref="uploadRef" :questionMaxId="props.questionMaxId" @upload="upload"></survey-upload>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { contrlType, questionType, contrlChildrenType } from "@/types/index";
import { contrlList } from "@/assets/common/local-data";
import surveyUpload from "./survey-upload.vue";

const props = defineProps({
  questionMaxId: {
    type: Number,
    default: 1000,
  }
});

const contrlData: contrlType[] = contrlList;
const uploadRef = ref<any>(null);
const emit = defineEmits(["deriveContrl", "uploadData"]);

const clickControl = (contrl: contrlChildrenType) => {
  emit("deriveContrl", { title: contrl.title, type: contrl.type });
};

const download = () => {
  window.open("问卷模板.xlsx")
}

const upload = (e: { question: questionType[], radio: string }) => {
  emit("uploadData", e);
}
</script>
<style lang="scss" scoped>
.control-title {
  font-size: 16px;
  margin-bottom: 10px;
}

.control-item {
  width: 45%;
  padding: 5px;
  text-align: center;
  border: 1px solid #e4e4e4;
  border-radius: 5px;
  margin-bottom: 10px;
  cursor: pointer;

  &:hover {
    border: 1px solid #1890ff;
    color: #1890ff;
  }
}

.control-nav {
  .ant-btn {
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0
    }
  }
}
</style>
