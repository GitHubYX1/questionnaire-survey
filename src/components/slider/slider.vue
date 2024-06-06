<template>
  <div class="slider-text flex-between" v-if="textShow">
    <span>{{ min.content }}</span>
    <span>{{ max.content }}</span>
  </div>
  <a-slider :min="min.id" :max="max.id" @change="sliderChange" :value="value" :disabled="disabled" />
</template>
<script lang="ts" setup>
import { type PropType } from "vue";
import type { optionType } from "../../types";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  value: {
    type: Number,
    default: 0
  },
  textShow: {
    type: Boolean,
    default: true
  },
  min: {
    type: Object as PropType<optionType>,
    default: () => {
      return {
        content: "",
        id: 0
      }
    }
  },
  max: {
    type: Object as PropType<optionType>,
    default: () => {
      return {
        content: "",
        id: 100
      }
    }
  }
});

const emit = defineEmits(["update:value", "change"]);

const sliderChange = (value: number) => {
  console.log("value", value);
  emit("update:value", value);
  emit("change", value);
};
</script>
<style lang="scss" scoped>
.slider-text {
  margin-top: 10px;
}
</style>
