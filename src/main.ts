import { createApp } from "vue";
import { createPinia } from "pinia";
import design from "ant-design-vue";
import * as Icons from "@ant-design/icons-vue";
import "ant-design-vue/dist/antd.css";
import { loading } from "@/components/loading/loading";
import sliderOutlined from "@/components/icon/slider-outlined.vue";
import radioOutlined from "@/components/icon/radio-outlined.vue";
import matrixCheckboxOutlined from "@/components/icon/matrix-checkbox-outlined.vue";
import matrixRadioOutlined from "@/components/icon/matrix-radio-outlined.vue";
import matrixSliderOutlined from "@/components/icon/matrix-slider-outlined.vue";
import "./assets/css/main.css";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const iconData: any = Icons;
for (const i in iconData) {
  app.component(i, iconData[i]);
}
app.component("slider-outlined", sliderOutlined);
app.component("radio-outlined", radioOutlined);
app.component("matrix-checkbox-outlined", matrixCheckboxOutlined);
app.component("matrix-radio-outlined", matrixRadioOutlined);
app.component("matrix-slider-outlined", matrixSliderOutlined);
app.use(createPinia()).use(router).use(design).provide("loading", loading).mount("#app");
