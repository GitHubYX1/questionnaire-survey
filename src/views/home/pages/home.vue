<template>
  <div class="content-box">
    <div class="content-header"><span>首页</span></div>
    <div class="user-data flex-between align-items">
      <div class="flex align-items">
        <a-avatar :src="user.userData.avatar" :size="64" />
        <span class="user-name">{{ user.userData.name }}</span>
      </div>
      <div class="stat-list flex">
        <div class="stat-item">
          <p>问卷数</p>
          <span>{{storeData.surveyData.length}}</span>
        </div>
        <div class="stat-item">
          <p>答题数</p>
          <span>{{getAnswerNum('add')}}</span>
        </div>
      </div>
    </div>
    <a-card>
      <a-table :dataSource="answerData" bordered rowKey="answerId">
        <a-table-column key="surveyId" title="问卷id" dataIndex="surveyId" align="center" width="120px"></a-table-column>
        <a-table-column key="answerId" title="答案id" dataIndex="answerId" align="center" width="180px"></a-table-column>
        <a-table-column key="answerId" title="问卷名称" dataIndex="surveyTitle" align="center"></a-table-column>
        <a-table-column key="answerId" title="开始时间" dataIndex="startTime" align="center" width="180px"></a-table-column>
        <a-table-column key="answerId" title="结束时间" dataIndex="endTime" align="center" width="180px"></a-table-column>
        <a-table-column key="answerId" title="答题用时" dataIndex="consumTime" align="center" width="180px"></a-table-column>
        <a-table-column key="answerId" title="操作" align="center" width="100px">
          <template #default="{ record }">
            <a-button type="link" size="small" @click="editClick(record.surveyId,record.answerId)">查看答案</a-button>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
  </div>
</template>

<script lang='ts' setup>
import { useRouter } from "vue-router";
import { userStore } from "@/stores/user";
import { surveyStore } from "@/stores/survey";
import { getAnswerNum, getAnswerData } from "@/computed/answer";

const router = useRouter();
const user = userStore();
const storeData = surveyStore();
const answerData = getAnswerData()

const editClick =(surveyId:string,answerId:string)=>{
  router.push("/preview?id="+surveyId+"&answerId="+answerId);
}
</script>
<style lang='scss' scoped>
.user-data {
  padding-bottom: 20px;

  .user-name {
    font-size: 20px;
    font-weight: bold;
    margin-left: 30px;
  }
  .stat-item{
    padding-left: 35px;
    p{
      font-size: 14px;
      margin-bottom: 5px;
      color: #898989;
    }
    span{
      font-size: 24px;
    }
  }
}
</style>