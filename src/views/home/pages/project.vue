<template>
  <div class="project-box flex-between">
    <a-button type="primary" size="large" style="width: 200px" @click="newBuilt">+ 新建</a-button>
    <div class="project-content">
      <div class="content-header flex-between align-items">
        <span>我的项目</span>
        <div class="project-screen">
          <a-select v-model:value="stateValue" style="width: 120px" @change="onScreen">
            <a-select-option value="">状态</a-select-option>
            <a-select-option :value="true">已发布</a-select-option>
            <a-select-option :value="false">未发布</a-select-option>
          </a-select>
          <a-input-search v-model:value="searchValue" placeholder="请输入问卷名称进行搜索" style="width: 240px" @search="onScreen"
            @pressEnter="onScreen" />
        </div>
      </div>
      <div class="project-list">
        <div class="project-item" v-for="item in surveyList" :key="item.id">
          <div class="project-item-info flex-between align-items">
            <div class="project-info-Left">{{ item.title }}</div>
            <div class="project-info-right">
              <span>ID：{{ item.id }}</span>
              <span>状态：{{ item.state ? "已发布" : "未发布" }}</span>
              <span>答题数：{{ getAnswerNum(item.id) }}</span>
              <span>创建时间：{{ item.createTime }}</span>
            </div>
          </div>
          <div class="project-item-operate flex-between align-items">
            <div class="project-operate-Left">
              <span @click="edit(item.id)"><form-outlined />编辑问卷</span>
              <span @click="answer(item.id)"><profile-outlined />回答问卷</span>
              <span @click="dataAnalysis(item.id)"><FundOutlined />数据分析</span>
            </div>
            <div class="project-operate-right">
              <span><a-switch v-model:checked="item.state" @change="stateChange(item.id, item.state)"
                  checked-children="发布" un-checked-children="停止" /></span>
              <span @click="copyClick(item)"><copy-outlined />复制</span>
              <span @click="erasure(item.id)"><delete-outlined />删除</span>
            </div>
          </div>
        </div>
        <a-empty :image="simpleImage" v-if="surveyList.length === 0" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Modal, Empty } from "ant-design-vue";
import shortId from "shortid";
import { getTime } from "@/utils/index";
import { surveyStore } from "@/stores/survey";
import type { surveyType } from "@/types/index";
import { getAnswerNum, answerErasure } from "@/computed/answer";

const router = useRouter();
const storeData = surveyStore();
const surveyList = ref<surveyType[]>([]);
const searchValue = ref("");
const stateValue = ref<boolean | "">("");
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

onMounted(() => {
  surveyList.value = storeData.surveyData;
});

const newBuilt = () => {
  router.push("/investigation");
  storeData.modifySurveyId("");
};

//切换状态
const stateChange = (id: string, state: boolean) => {
  storeData.stateModify(id, state);
};

//点击编辑
const edit = (id: string) => {
  router.push("/investigation");
  storeData.modifySurveyId(id);
};
//答题
const answer = (id: string) => {
  router.push("/question?id=" + id);
};

const dataAnalysis = (id: string) => {
  router.push("/data/analysis");
  storeData.modifySurveyId(id);
}

//复制
const copyClick = (item: surveyType) => {
  let survey = JSON.parse(JSON.stringify(item));
  survey.id = shortId.generate();
  survey.title = survey.title + "【复制】";
  survey.createTime = getTime();
  survey.modifyTime = "";
  survey.state = false;
  storeData.surveyAdd(survey);
};

//删除
const erasure = (id: string) => {
  Modal.confirm({
    title: "提示",
    content: `删除该调查？`,
    okText: "确认",
    cancelText: "取消",
    onOk() {
      surveyList.value = surveyList.value.filter((item) => item.id !== id);
      storeData.surveyErasure(id);
      answerErasure(id);
    },
  });
};

const onScreen = () => {
  surveyList.value = storeData.surveyData.filter(item => item.title.indexOf(searchValue.value) != -1 && (stateValue.value !== "" ? item.state == stateValue.value : true));
};
</script>
<style lang="scss" scoped>
.project-box {
  width: 1400px;
  padding: 15px 0;
  margin: 0 auto;

  .project-content {
    width: calc(100% - 260px);

    .content-header {
      height: 40px;

      .ant-select {
        margin-right: 30px;
      }
    }
  }
}



.project-list {
  .ant-tag {
    cursor: pointer;
  }

  .project-item {
    padding: 0 15px;
    background: #fff;
    border: 1px solid #e6e6e6;
    margin-bottom: 30px;

    .project-item-info {
      border-bottom: 1px solid #e6e6e6;
      padding: 15px 0;

      .project-info-right {
        font-size: 14px;

        span {
          margin: 0 15px;
        }
      }
    }

    .project-item-operate {
      padding: 15px 0;

      .project-operate-Left {
        color: #7a7a7a;
        cursor: pointer;

        >span {
          margin: 0 15px;

          &:hover {
            color: #1890ff;
          }
        }
      }

      .project-operate-right {
        font-size: 14px;
        color: #7a7a7a;
        cursor: pointer;

        >span {
          margin: 0 15px;

          &:hover {
            color: #1890ff;
          }
        }
      }
    }
  }
}
</style>
