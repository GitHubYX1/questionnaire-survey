<template>
  <div class="slider-option">
    <span>最小值：</span> <a-input style="width: 80px" v-model:value="minNumber" @blur="handleInputBlur(0, minNumber)" />
    <span>最小值显示文本：</span>
    <a-input style="width: 100px" v-model:value="min.content" /> <br />
    <span>最大值：</span> <a-input style="width: 80px" v-model:value="maxNumber" @blur="handleInputBlur(1, maxNumber)" />
    <span>最大值显示文本：</span>
    <a-input style="width: 100px" v-model:value="max.content" />
  </div>
</template>
<script lang="ts" setup>
import { ref, type PropType } from "vue";
import { message } from "ant-design-vue";
import type { optionType } from "@/types/index";
import { isValidNumber } from "@/utils/isValidType";

const emit = defineEmits(["change"]);

const props = defineProps({
  min: {
    type: Object as PropType<optionType>,
    default: () => {
      return {
        content: "",
        id: 0,
      };
    },
  },
  max: {
    type: Object as PropType<optionType>,
    default: () => {
      return {
        content: "",
        id: 100,
      };
    },
  },
});

const minNumber = ref(props.min.id);
const maxNumber = ref(props.max.id);

// 处理输入框失焦事件
const handleInputBlur = (num: number, value: number) => {
  value = Number(value);
  if (!isValidNumber(value)) {
    const text = num === 0 ? "最小值" : "最大值";
    message.error(`${text}输入内容不合法！`);
    updateInputValue(num, num === 0 ? props.min.id : props.max.id);
    return;
  }
  if ((num === 0 && value >= maxNumber.value) || (num === 1 && value <= minNumber.value)) {
    message.error(`最大值不能小于最小值！`);
    updateInputValue(num, maxNumber.value);
  } else {
    emit("change", num, value);
  }
}

//更新输入值
const updateInputValue = (num: number, defaultValue: number) => {
  if (num === 0) {
    minNumber.value = defaultValue;
  } else {
    maxNumber.value = defaultValue;
  }
};
</script>
<style lang="scss" scoped>
.slider-option {
  margin: 10px 0;

  .ant-input {
    margin-top: 10px;
    margin-right: 10px;
  }
}
</style>
