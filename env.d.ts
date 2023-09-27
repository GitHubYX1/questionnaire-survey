/// <reference types="vite/client" />

declare module "*.vue" {
  import { ComponentOptions } from "vue";
  const componentOptions: ComponentOptions;
  export default componentOptions;
}

declare module '@wangeditor/editor-for-vue'
declare module 'jszip-utils' //告诉ts引入了jszip-utils文件