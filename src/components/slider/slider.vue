<template>
  <div class="slider-text flex-between" v-if="textShow">
    <span>{{ min.content }}</span>
    <span>{{ max.content }}</span>
  </div>
  <a-slider :min="min.id" :max="max.id" @change="sliderChange" :value="value" :disabled="disabled" />
</template>
<script lang="ts" setup>
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
    type: Object,
    default: () => {
      return {
        content: "",
        value: 0
      }
    }
  },
  max: {
    type: Object,
    default: () => {
      return {
        content: "",
        value: 100
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
