<template>
  <div class="matrix-item">
    <div class="matrix-option-list">
      <div class="matrix-option-item" v-for="item in question.option" :key="item.id">{{ item.content }}</div>
    </div>
    <a-form-item v-for="item in question.children" :key="item.id" :label="item.title" :name="item.id" :rules="rules">
      <a-radio-group class="matrix-question-list" v-if="item.type === typeEnum.MATRIX_RADIO" v-model:value="formState[item.id]">
        <a-radio class="flex item-option" v-for="subItem in item.option" :key="subItem.id" :value="subItem.id"
          :name="subItem.content"></a-radio>
      </a-radio-group>
      <a-checkbox-group class="matrix-question-list" v-else-if="item.type === typeEnum.MATRIX_CHECKBOX" v-model:value="formState[item.id]">
        <a-checkbox class="flex item-option" v-for="subItem in item.option" :key="subItem.id" :value="subItem.id"
          :name="subItem.content"></a-checkbox>
      </a-checkbox-group>
      <template v-else-if="item.type === typeEnum.MATRIX_SLIDER" v-model:value="formState[item.id]">
        <slider :min="item.option[0]" :max="item.option[1]" :textShow="false" v-model:value="formState[item.id]"></slider>
      </template>
      </a-form-item>
    </div>
</template>
<script lang="ts" setup>
import { type PropType } from "vue";
import slider from "../slider/slider.vue";
import type { questionType, optionType } from "../../types";
import { typeEnum } from "../../assets/common/enums";

const props = defineProps({
  question: {
    type: Object as PropType<questionType>,
    default: {},
  },
  formState: {
    type: Object,
    default: () => ({})
  },
  rules:{
    type:Array,
    default: () => ([])
  }
})
</script>
<style lang="scss" scoped>
.matrix-item {

  .matrix-option-list {
    background: #F3F4F6;
    padding: 10px 0;
    display: flex;

    .matrix-option-item {
      flex: 1;
      text-align: center;
    }
  }

  :deep(.ant-form-item-label) {
    width: 100%;
    text-align: left;
  }

  .matrix-question-list {
    width: 100%;
    display: flex;

    .item-option{
      flex: 1;
      text-align: center;

      :deep(.ant-radio) {
        margin: 0 auto;
      }
      :deep(.ant-checkbox){
        margin: 0 auto;
      }
    }
  }
}
</style>