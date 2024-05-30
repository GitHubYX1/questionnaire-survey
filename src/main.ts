import { createApp } from "vue";
import { createPinia } from "pinia";
import design from "ant-design-vue";
import * as Icons from "@ant-design/icons-vue";
import "ant-design-vue/dist/antd.css";
import { loading } from "@/components/loading/loading";
import sliderOutlined from "@/components/icon/slider-outlined.vue";
import "./assets/css/main.css";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const iconData: any = Icons;
for (const i in iconData) {
  app.component(i, iconData[i]);
}
app.component("slider-outlined", sliderOutlined);
app.use(createPinia()).use(router).use(design).provide("loading", loading).mount("#app");
