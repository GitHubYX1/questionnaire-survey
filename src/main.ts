import { createApp } from "vue";
import { createPinia } from "pinia";
import design from "ant-design-vue";
import * as Icons from "@ant-design/icons-vue";
import "ant-design-vue/dist/antd.css";
import { loading } from '@/components/loading/loading'
import "./assets/css/main.css";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const iconData: any = Icons;
for (const i in iconData) {
  app.component(i, iconData[i]);
}

app.use(createPinia()).use(router).use(design).provide("loading",loading).mount("#app");
