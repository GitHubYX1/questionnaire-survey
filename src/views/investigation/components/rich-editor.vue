<template>
  <div :style="'border: 1px solid #ccc;margin-bottom:'+props.marginBottom+'px'">
    <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    <Editor :style="'height: '+props.height+'px; overflow-y: hidden;'" v-model="valueHtml" :defaultConfig="editorConfig" :mode="mode"
      @onCreated="handleCreated" @onChange="onChange" />
  </div>
</template>
<script lang="ts" setup>
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { onBeforeUnmount, ref, shallowRef } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const mode = "mode";
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height:{
    type:Number,
    default:440
  },
  marginBottom:{
    type:Number,
    default:0
  }
})

// 内容 HTML
const valueHtml = ref(props.modelValue);
const emit = defineEmits(["update:modelValue"]);

const toolbarConfig = {
  excludeKeys: [
  'group-video',//不显示插入视频
    'insertTable',//不显示表格
    'fullScreen',//不显示全屏
    
  ]
};
const editorConfig = {
  placeholder: "请输入内容...",
  MENU_CONF: {
    uploadImage: {
      customUpload: (file: any, insertFn: any) => {
        let name = file.name;
        const reader = new FileReader()
        reader.readAsDataURL(file) // 读出 base64
        reader.onload = () => {
          const _base64 = reader.result
          insertFn(_base64,name)
        }
      },
      base64LimitSize: 5 * 1024
    }
  }
};

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};

const onChange = () => {
  emit("update:modelValue", valueHtml.value);
}
</script>
