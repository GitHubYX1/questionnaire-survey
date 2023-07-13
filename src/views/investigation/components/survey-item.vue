<template>
  <div class="survey-item">
    <div :class="['survey-title', props.question.must ? 'required' : '']" v-if="props.question.type !== '段落说明'">{{
      props.serialNum }}.{{ props.question.title }}</div>
    <div v-else v-html="props.question.title"></div>
    <div class="survey-option">
      <a-radio-group v-if="props.question.type === '单选'" class="grid" :style="generateColumn(props.question.column)" v-model:value="radioData">
        <a-radio class="flex item-option" v-for="subItem in  props.question.option" :key="subItem.id" :value="subItem.id"
          :name="subItem.content">{{ subItem.content }}</a-radio>
      </a-radio-group>
      <a-checkbox-group v-if="props.question.type === '多选'" class="grid" :style="generateColumn(props.question.column)">
        <a-checkbox class="flex item-option" v-for="subItem in props.question.option" :key="subItem.id"
          :value="subItem.id" :name="subItem.content">{{ subItem.content }}</a-checkbox>
      </a-checkbox-group>
      <a-input v-if="props.question.type === '填空'" />
      <div class="survey-menu" v-if="edit.editId != props.question.id">
        <div class="survey-menu-box ">
          <span class="survey-insert" @click="insertClick">{{ insertNum !== index ? '在此题后插入新题' : '插入题目' }}</span>
          <div class="menu-buttom">
            <a-button type="primary" ghost size="small" @click="editClick">编辑</a-button>
            <a-button type="primary" ghost size="small" @click="copyClick">复制</a-button>
            <a-button type="primary" ghost size="small" @click="erasureClick">删除</a-button>
            <a-button type="primary" ghost size="small" @click="moveClick('上')">上移</a-button>
            <a-button type="primary" ghost size="small" @click="moveClick('下')">下移</a-button>
            <a-button type="primary" ghost size="small" @click="moveClick('前')">最前</a-button>
            <a-button type="primary" ghost size="small" @click="moveClick('后')">最后</a-button>
          </div>
        </div>
      </div>
      <div class="item-editor" v-else>
        <template v-if="props.question.type !== '段落说明'">
          <div class="editor-title">
            <p class="title">题目标题：</p><a-input v-model:value="props.question.title" />
          </div>
          <div class="editor-type flex align-items">
            <a-radio-group v-model:value="typeRadio" :name="'radio' + props.question.id" @change="typeChange">
              <a-radio class="editor-option" value="单选">单选</a-radio>
              <a-radio class="editor-option" value="多选">多选</a-radio>
              <a-radio class="editor-option" value="填空">填空</a-radio>
            </a-radio-group>
            <a-checkbox class="editor-option" v-model:checked="mustBoolean" @change="checkboxChange">必答</a-checkbox>
            <a-select v-model:value="props.question.column" style="width: 100px;"
              v-if="props.question.type === '单选' || props.question.type === '多选'">
              <a-select-option :value="1">一列</a-select-option>
              <a-select-option :value="2">两列</a-select-option>
              <a-select-option :value="3">三列</a-select-option>
            </a-select>
          </div>
        </template>

        <rich-editor v-model="props.question.title" :height="200" :marginBottom="30" v-else></rich-editor>
        <template v-if="props.question.type === '单选' || props.question.type === '多选'">
          <a-table :dataSource="props.question.option" :pagination="false" bordered rowKey="id">
            <a-table-column key="id" title="选项文字" align="center">
              <template #default="{ record, index }">
                <a-input v-model:value="record.content" style="width: 80%;" />
                <span class="option-icon"><plus-outlined @click="optionAddClick(index)" /></span>
                <span class="option-icon"><minus-outlined @click="optionRemoveClick(index)" /></span>
              </template>
            </a-table-column>
            <a-table-column key="id" title="上下移动" align="center">
              <template #default="{ index }">
                <span class="option-icon"> <arrow-up-outlined @click="optionMoveClick(index, '上')" /></span>
                <span class="option-icon"><arrow-down-outlined @click="optionMoveClick(index, '下')" /></span>
              </template>
            </a-table-column>
          </a-table>
          <div class="option-add">
            <a-button type="link" size="large" @click="optionAddClick(-1)">添加选项</a-button>
            <a-button type="link" size="large" @click="optionAddClick(-2)"> 批量添加</a-button>
          </div>
        </template>
        <div class="logic-set flex align-items">
          <span>逻辑设置：</span>
          <a @click="concernClick(1)">题目向前关联</a>
          <a>复制向前关联</a>
        </div>
        <a-button type="primary" block size="large" @click="edit.resetting()">完成编辑</a-button>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, type PropType } from "vue"
import type { typeType, questionType } from "@/types/index";
import { Modal } from "ant-design-vue";
import { editStore } from "@/stores/survey";
import RichEditor from "./rich-editor.vue";

const edit = editStore();
const emit = defineEmits(['insert', 'copy', 'erasure', 'move', 'mustSelect', 'typeModify', 'optionAdd', 'optionRemove', 'optionMove', 'concern']);

const props = defineProps({
  question: {
    type: Object as PropType<questionType>,
    default: {}
  },
  index: {
    type: Number,
    default: 0
  },
  serialNum: {
    type: Number,
    default: 0
  },
  insertNum: {
    type: Number,
    default: -1
  },
})

let radioData = ref('')
const mustBoolean = ref<boolean>(props.question.must == 1 ? true : false);
const typeRadio = ref<typeType>(props.question.type);

function generateColumn(column: number) {
  return { 'grid-template-columns': `repeat(${column}, minmax(0, 1fr))` };
}

//插入数据
const insertClick = () => {
  let index = props.index
  if (index === props.insertNum) index = -1
  emit('insert', index)
}
//复制
const copyClick = () => {
  emit('copy', { question: props.question, index: props.index });
}
//删除
const erasureClick = () => {
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      emit('erasure', props.index);
    },
  });
}
//移动
const moveClick = (action: string) => {
  emit('move', { index: props.index, action });
}
//点击编辑
const editClick = () => {
  edit.editCount(props.question.id)
}
//点击必答
const checkboxChange = () => {
  emit('mustSelect', { index: props.index, must: mustBoolean.value });
}
//切换类型
const typeChange = () => {
  Modal.confirm({
    title: '提示',
    content: `是否将${props.question.type}题改为${typeRadio.value}题？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      emit('typeModify', { index: props.index, type: typeRadio.value });
    },
    onCancel() {
      typeRadio.value = props.question.type
    },
  });
}
//选项添加
const optionAddClick = (optionIndex: number) => {
  emit('optionAdd', { index: props.index, optionIndex });
}
//选项移除
const optionRemoveClick = (optionIndex: number) => {
  if (props.question.option.length > 1) {
    emit('optionRemove', { index: props.index, optionIndex });
  } else {
    Modal.warning({
      title: '提示',
      content: '不能删除所有选项',
    });
  }
}
//选项移动
const optionMoveClick = (optionIndex: number, action: string) => {
  if (optionIndex == 0 && action == '上') return
  emit('optionMove', { index: props.index, optionIndex, action });
}
//题目关联
const concernClick = (state:number)=>{
  emit('concern',{ index: props.index, id:props.question.id, title:props.question.type, state })
}
</script>
<style lang='scss' scoped>
.survey-item {
  font-size: 16px;
  padding: 10px;
  border-bottom: 1px solid #efefef;

  .survey-menu {
    height: 35px;
    line-height: 35px;
  }

  .survey-menu-box {
    display: none;

    .menu-buttom {
      float: right;

      .ant-btn {
        margin-left: 15px;
      }
    }
  }

  &:hover .survey-menu-box {
    display: block;
  }
}

.required {
  position: relative;

  &::before {
    content: '* ';
    color: red;
    margin-left: -10px;
  }
}

.survey-title {
  margin-bottom: 10px;
}

.survey-insert {
  color: #40a9ff;
  cursor: pointer;
  text-decoration: underline;
}

.grid .ant-checkbox-group,
.grid .ant-radio-group {
  width: 100%;
}

.item-option {
  width: 100%;
  margin: 0;
  line-height: 40px;
  font-size: 16px;
  padding: 0 10px;
  &:hover {
    background: #f9f9f9;
  }
}

.item-editor {
  padding: 15px;
  border: 1px solid #efefef;
  margin-top: 15px;
  border-radius: 5px;

  .editor-title {
    .title {
      padding-bottom: 10px;
    }
  }

  :deep(.ant-table-cell) {
    padding: 10px;
  }

  .option-icon {
    padding: 0 10px;
    cursor: pointer;
  }

  .editor-type {
    padding: 10px;

    .editor-option {
      font-size: 16px;
    }
  }

  .option-tbody-top {
    background: #e8e8e8;
  }

  .option-add {
    padding: 5px 0;
  }
}


.logic-set{
  background: #e8e8e8;
  padding: 10px;
  margin-bottom: 15px;
  a{
    margin: 0 15px;
    &:hover{
      background: transparent;
    }
  }
}
</style>