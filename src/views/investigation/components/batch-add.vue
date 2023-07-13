<template>
  <a-modal :visible="batchVisible" title="选项批量添加" width="500px"  @cancel="batchCancel" @ok="batchOk">
      <div class="batch-box">
        <a-textarea v-model:value="optionText"  allow-clear />
      </div>
  </a-modal>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import { Modal } from 'ant-design-vue';

const batchVisible = ref(false)
const optionText = ref('')
const indexNum = ref(0)
const emit = defineEmits(['optionBatchAdd'])
// 打开
const batchOpen =  (index:number,text:string) => {
    batchVisible.value = true
    optionText.value = text
    indexNum.value = index
}

const batchCancel= (e:any)=>{
    if (e.target.className != "ant-modal-wrap") batchVisible.value = false
}
const batchOk = ()=>{
    if(optionText.value.replace(/\s*/g,"") == ''){
       return Modal.warning({
        title: '提示',
        content: '添加内容必填',
      });
    }
    batchVisible.value = false
    emit('optionBatchAdd', { index: indexNum.value, optionText:optionText.value });
}

defineExpose({ batchOpen })
</script> 
<style lang="scss" scoped>
.batch-box{
    .ant-input-affix-wrapper{
        height: 200px;
    }
}
</style>