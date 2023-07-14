<template>
    <a-modal :visible="copyVisible" title="复制向前关联" width="800px" :mask="false" @cancel="onCancel" @ok="handleOk">
        <div class="copy-box">
            <a-table :row-selection="rowSelection" :dataSource="tableData" :pagination="false" bordered rowKey="id">
                <a-table-column key="id" title="题目标题" align="center">
                    <template #default="{ record, index }">
                        <div v-html="record.title"></div>
                    </template>
                </a-table-column>
            </a-table>
        </div>
    </a-modal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { message } from "ant-design-vue";
import type { optionType, questionType, controlLogicType } from "@/types/index";

const copyVisible = ref(false);
const tableData = ref<questionType[]>([]);
const childIds = ref<number[]>([]);
const ids = ref<number>(0);
const titleText = ref('');
const emit = defineEmits(['getCopy']);

const copyOpen = (data: questionType[], title: string, id:number) => {
    if (data.length === 0) return message.info("此题后面没有选项，无法复制！");
    copyVisible.value = true;
    tableData.value = data;
    childIds.value = [];
    titleText.value = title;
    ids.value = id;
}

const rowSelection ={
    onChange: (selectedRowKeys: number[],selectedRows:questionType[]) => {
        console.log('打印selectedRows',selectedRows);
        childIds.value = selectedRowKeys;
    },
    selectedRowKeys:childIds.value
}

//取消
const onCancel = (e: any) => {
    if (e.target.className != "ant-modal-wrap") copyVisible.value = false;
};

const handleOk = () => {
    copyVisible.value = false;
    if(childIds.value.length )emit("getCopy", {id:ids.value,childId:childIds.value});
    
}

defineExpose({ copyOpen })
</script>
<style lang="scss" scoped></style>