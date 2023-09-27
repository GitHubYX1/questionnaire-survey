<template>
  <div class="data-header flex-between align-items">
    <!-- <div class="data-source">{{ title }}</div> -->
    <a-select v-model:value="surveyIdData" show-search :options="storeOptions" style="width: 380px"
      :filter-option="filterOption" @select="select" />
    <div class="anv-list flex align-items">
      <div :class="['anv-item', selectedKe() == '/data/analysis' ? 'select' : '']" @click="routerPush('/data/analysis')">
        <PieChartOutlined />
        <div>数据分析</div>
      </div>
      <div :class="['anv-item', selectedKe() == '/data/answer' ? 'select' : '']" @click="routerPush('/data/answer')">
        <LaptopOutlined />
        <div>答题数据</div>
      </div>
    </div>
    <a-tooltip placement="bottom" title="返回">
      <div class="option flex align-items" @click="quit">
        <export-outlined />
        <span>返回</span>
      </div>
    </a-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { surveyStore } from "@/stores/survey";

interface optionType {
  value: string;
  label: string;
}

const router = useRouter();
const storeData = surveyStore();
const storeOptions = ref<optionType[]>([]);
const surveyIdData = ref<string>("");

onMounted(() => {
  let surveyId = storeData.surveyId;
  if (surveyId) {
    storeOptions.value = storeData.surveyData.map(item => ({ value: item.id, label: item.title }));
    surveyIdData.value = surveyId;
  }
});

const filterOption = (input: string, option: optionType) => {
  return option.label.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};

const select = (event: string) => {
  storeData.modifySurveyId(event);
}

const selectedKe = () => {
  return router.currentRoute.value.path;
};

const routerPush = (path: string) => {
  router.push(path);
};

const quit = () => {
  router.replace("/project");
};
</script>
<style lang="scss" scoped>
.data-header {
  height: 100%;
  position: relative;
}

.data-source {
  width: 380px;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  line-height: 35px;
  padding: 0 15px;
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.anv-list {
  height: 100%;
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);

  .anv-item {
    height: 100%;
    padding: 0 20px;
    cursor: pointer;
    text-align: center;
    line-height: normal;
    font-size: 14px;

    span {
      font-size: 26px;
      margin: 6px;
    }

    &:hover {
      background: #f7f7f7;
    }
  }

  .select {
    background: #1890ff;
    color: #fff;

    &:hover {
      background: #1890ff;
    }
  }
}

.option {
  cursor: pointer;
  font-size: 18px;

  >span {
    margin-left: 10px;
  }
}
</style>
