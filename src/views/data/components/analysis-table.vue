<template>
  <div class="table-data">
    <a-table :dataSource="tableData?.option" bordered rowKey="id" :pagination="false">
      <a-table-column key="id" title="选项" dataIndex="content" align="center" width="33%"></a-table-column>
      <a-table-column key="id" title="样本量" dataIndex="count" align="center" width="33%"></a-table-column>
      <a-table-column key="id" title="比例" dataIndex="ratio" align="center" width="33%">
        <template #default="{ record }"><a-progress :percent="record.ratio" status="active" /></template>
      </a-table-column>
    </a-table>
    <div class="step-total">
      本题有效填写人次：<span>{{ tableData?.assessCount }} </span> 人
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type PropType } from "vue";
import type { analysisType } from "@/types/index";
const props = defineProps({
  tableData: {
    type: Object as PropType<analysisType>,
  },
});
</script>
<style lang="scss" scoped>
.table-data {
  margin-top: 15px;

  :deep(.ant-progress) {
    .ant-progress-bg {
      height: 12px !important;
    }
  }

  .step-total {
    text-align: center;
    font-size: 18px;

    span {
      color: #4189FF;
      font-weight: 700;
    }
  }
}
</style>
