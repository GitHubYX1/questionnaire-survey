<template>
  <a-modal :visible="visible" width="860px" @cancel="onCancel" @ok="handleOk">
    <div class="modal-box">
      <div class="editor-title flex" style="margin-bottom: 30px;">
        <div class="title">标题：</div>
        <a-input v-model:value="titleValue" />
      </div>
      <div class="editor-title flex">
        <div class="title">说明</div>
        <div class="title-rich"><rich-editor v-model="contentValue"></rich-editor></div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import RichEditor from "./rich-editor.vue";

const visible = ref(false);
const titleValue = ref("");
const contentValue = ref("");
const emit = defineEmits(["titleModify"]);
// 打开
const open = (title: string, content: string) => {
  visible.value = true;
  titleValue.value = title;
  contentValue.value = content
};

const onCancel = (e: any) => {
  if (e.target.className != "ant-modal-wrap") visible.value = false;
};

const handleOk = () => {
  visible.value = false;
  if (contentValue.value.replace(/<[^>]+>/g, "") == '') {
    contentValue.value = ''
  }
  console.log('打印文本', contentValue.value)
  emit("titleModify", { title: titleValue.value, content: contentValue.value });
};

defineExpose({ open });
</script>
<style lang="scss" scoped>
.modal-box {
  padding-top: 30px;
}

.editor-title {
  .title {
    width: 50px;
    line-height: 32px;
  }
}

.title-rich {
  width: 100%;
}
</style>
