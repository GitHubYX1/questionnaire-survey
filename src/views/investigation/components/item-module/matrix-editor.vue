<template>
  <div class="matrix-editor">
    <table class="matrix-editor-table" v-if="question.type === typeEnum.MATRIX_SLIDER" border="1">
      <thead>
        <tr>
          <th class="matrix-first">行标题\选项</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in question.children" :key="item.id">
          <td class="matrix-first"><a-input v-model:value="item.title" style="width: 85%" />
            <a-dropdown>
              <MoreOutlined />
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="removeRows(index)">删除</a-menu-item>
                  <a-menu-item @click="addRows(index)">添加</a-menu-item>
                  <a-menu-item @click="moveRows(index, '上')">上移</a-menu-item>
                  <a-menu-item @click="moveRows(index, '下')">下移</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </td>
          <td>
            <slider :disabled="true" :min="props.question.option[0]" :max="props.question.option[1]" :textShow="false">
            </slider>
          </td>
        </tr>
      </tbody>
    </table>
    <table class="matrix-editor-table" v-else border="1">
      <thead>
        <tr>
          <th class="matrix-first">行标题\选项</th>
          <th v-for="(item, index) in question.option" :key="item.id"><a-input v-model:value="item.content"
              style="width: 85%" />
            <a-dropdown>
              <MoreOutlined />
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="removeColumn(index, item.id)">删除</a-menu-item>
                  <a-menu-item @click="addColumn(index)">添加</a-menu-item>
                  <a-menu-item @click="moveColumn(index, '上')">左移</a-menu-item>
                  <a-menu-item @click="moveColumn(index, '下')">右移</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in question.children" :key="item.id">
          <td class="matrix-first"><a-input v-model:value="item.title" style="width: 85%" />
            <a-dropdown>
              <MoreOutlined />
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="removeRows(index)">删除</a-menu-item>
                  <a-menu-item @click="addRows(index)">添加</a-menu-item>
                  <a-menu-item @click="moveRows(index, '上')">上移</a-menu-item>
                  <a-menu-item @click="moveRows(index, '下')">下移</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </td>
          <template v-if="question.type === typeEnum.MATRIX_RADIO">
            <td v-for="option in question.option" :key="option.id">
              <a-radio :disabled="true"></a-radio>
            </td>
          </template>
          <template v-else>
            <td v-for="option in question.option" :key="option.id">
              <a-checkbox :disabled="true"></a-checkbox>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
    <div class="option-add">
      <a-button type="link" size="large" @click="addRows(-1)">添加行</a-button>
      <a-button type="link" size="large" v-if="question.type !== typeEnum.MATRIX_SLIDER" @click="addColumn(-1)">
        添加列</a-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { type PropType } from "vue";
import type { questionType } from "@/types/index";
import { typeEnum } from "@/assets/common/enums";
import slider from "@/components/slider/slider.vue";

const emit = defineEmits(["addRows", "addColumn", "removeRows", "moveRows", "removeColumn", "moveColumn"]);

const props = defineProps({
  question: {
    type: Object as PropType<questionType>,
    default: {},
  },
  index: {
    type: Number,
    default: 0,
  },
})

//添加行
const addRows = (rowsIndex = -1) => {
  emit("addRows", rowsIndex);
}

//删除行
const removeRows = (rowsIndex: number) => {
  emit("removeRows", rowsIndex);
}

//移动行
const moveRows = (rowsIndex: number, action: string) => {
  emit("moveRows", rowsIndex, action);
}

//添加列
const addColumn = (columnIndex = -1) => {
  emit("addColumn", columnIndex);
}

//删除列
const removeColumn = (columnIndex: number, id: number) => {
  emit("removeColumn", columnIndex, id);
}

//移动列
const moveColumn = (columnIndex: number, action: string) => {
  emit("moveColumn", columnIndex, action);
}

</script>
<style lang="scss" scoped>
.matrix-editor-table {
  width: 100%;
  text-align: center;

  th {
    font-weight: normal;
  }

  .matrix-first {
    width: 200px;
  }
}
</style>
