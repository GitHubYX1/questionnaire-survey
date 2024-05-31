<template>
  <div class="survey-item">
    <div v-if="props.question.type === PARAGRAPH" v-html="props.question.title"></div>
    <div class="survey-paging" v-else-if="props.question.type === PAGING">{{
      `第${props.question.currentPage}页（共${questionnaire.totalPage}页）` }}</div>
    <div :class="['survey-title', props.question.must ? 'required' : '']" v-else>{{ props.serialNum }}.{{
      props.question.title }}</div>
    <div class="survey-option">
      <a-radio-group v-if="props.question.type === RADIO" class="grid" :style="generateColumn(props.question.column)"
        v-model:value="radioData">
        <a-radio class="flex item-option" v-for="subItem in props.question.option" :key="subItem.id" :value="subItem.id"
          :name="subItem.content">
          {{ subItem.content }}
          <span v-if="optionLogic.length" class="item-logic">{{ optionLogicText(subItem.id, optionLogic) }}</span>
        </a-radio>
      </a-radio-group>
      <a-checkbox-group v-else-if="props.question.type === CHECKBOX" class="grid"
        :style="generateColumn(props.question.column)">
        <a-checkbox class="flex item-option" v-for="subItem in props.question.option" :key="subItem.id"
          :value="subItem.id" :name="subItem.content">
          {{ subItem.content }}
          <span v-if="optionLogic.length" class="item-logic">{{ optionLogicText(subItem.id, optionLogic) }}</span>
        </a-checkbox>
      </a-checkbox-group>
      <a-select v-else-if="props.question.type === DROP" class="drop-down" placeholder="请选择下拉列表">
        <a-select-option v-for="subItem in props.question.option" :key="subItem.id" :value="subItem.id">
          {{ subItem.content }}
          <span v-if="optionLogic.length" class="item-logic">{{ optionLogicText(subItem.id, optionLogic) }}</span>
        </a-select-option>
      </a-select>
      <a-rate v-else-if="props.question.type === SCORE" :value="scoreOption / 2" style="font-size: 28px"
        :count="scoreOption" disabled />
      <template v-else-if="props.question.type === FILL">
        <a-input v-if="props.question.column === 1" />
        <a-textarea v-else :rows="props.question.column" />
      </template>
      <slider v-else-if="props.question.type === SLIDER" :disabled="true" :min="props.question.option[0]"
        :max="props.question.option[1]"> </slider>
      <matrix-item v-else-if="matrixOptionShow" :question="question"></matrix-item>
      <div v-if="showConcern" class="show-concern" v-text="showConcern"></div>
      <div class="survey-menu" v-if="questionnaire.editId != props.question.id">
        <div class="survey-menu-box">
          <span class="survey-insert" @click="insertClick">{{ insertNum !== index ? "在此题后插入新题" : "插入题目" }}</span>
          <div class="menu-buttom">
            <template v-if="props.question.type !== PAGING">
              <a-button type="primary" ghost size="small" @click="editClick">编辑</a-button>
              <a-button type="primary" ghost size="small" @click="copyClick">复制</a-button>
            </template>
            <a-button type="primary" ghost size="small" @click="erasureClick">删除</a-button>
            <a-button type="primary" ghost size="small" @click="moveClick('上')">上移</a-button>
            <a-button type="primary" ghost size="small" @click="moveClick('下')">下移</a-button>
            <a-button type="primary" ghost size="small" @click="moveClick('前')">最前</a-button>
            <a-button type="primary" ghost size="small" @click="moveClick('后')">最后</a-button>
          </div>
        </div>
      </div>
      <div class="item-editor" v-else>
        <template v-if="props.question.type !== PARAGRAPH">
          <div class="editor-title">
            <p class="title">题目标题：</p>
            <a-input v-model:value="props.question.title" />
          </div>
          <div class="editor-type flex align-items">
            <a-select v-if="editorType.includes(props.question.type)" v-model:value="typeRadio"
              style="width: 90px; margin-right: 10px" @change="typeChange">
              <a-select-option :value="RADIO">单选</a-select-option>
              <a-select-option :value="CHECKBOX">多选</a-select-option>
              <a-select-option :value="FILL">填空</a-select-option>
            </a-select>
            <a-checkbox class="editor-option" v-model:checked="mustBoolean" @change="checkboxChange">必答</a-checkbox>
            <template v-if="props.question.type === CHECKBOX">
              <a-select v-model:value="props.question.chooseMin" style="width: 120px; margin-right: 10px">
                <a-select-option :value="0">最少选几项</a-select-option>
                <a-select-option v-for="(item, index) in props.question.option" :key="index"
                  :disabled="props.question.chooseMax && props.question.chooseMax <= index" :value="index + 1">
                  最少选{{ index + 1 }} 项
                </a-select-option>
              </a-select>
              <a-select v-model:value="props.question.chooseMax" style="width: 120px; margin-right: 10px">
                <a-select-option :value="0">最多选几项</a-select-option>
                <a-select-option v-for="(item, index) in props.question.option" :key="index"
                  :disabled="props.question.chooseMin > index + 1" :value="index + 1">
                  最多选{{ index + 1 }}项
                </a-select-option>
              </a-select>
            </template>
            <a-select v-model:value="props.question.column" style="width: 100px"
              v-if="props.question.type === RADIO || props.question.type === CHECKBOX">
              <a-select-option :value="1">一列</a-select-option>
              <a-select-option :value="2">两列</a-select-option>
              <a-select-option :value="3">三列</a-select-option>
            </a-select>
            <template v-else-if="props.question.type === FILL">
              <a-select v-model:value="props.question.validateType" :options="validateOption"
                style="width: 100px; margin-right: 10px"> </a-select>
              <a-select v-model:value="props.question.column" style="width: 100px">
                <a-select-option :value="1">一行</a-select-option>
                <a-select-option :value="2">两行</a-select-option>
                <a-select-option :value="3">三行</a-select-option>
                <a-select-option :value="4">四行</a-select-option>
              </a-select>
            </template>
          </div>
        </template>
        <rich-tinymce v-model="props.question.title" v-else></rich-tinymce>
        <template v-if="basicsOptionShow">
          <a-table :dataSource="props.question.option" :pagination="false" bordered rowKey="id">
            <a-table-column key="id" title="选项文字" align="center">
              <template #default="{ record, index }">
                <a-input v-model:value="record.content" style="width: 80%" />
                <span class="option-icon"><plus-outlined @click="optionAddClick(index)" /></span>
                <span class="option-icon"><minus-outlined @click="optionRemoveClick(index, record.id)" /></span>
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
        <div class="score-option" v-else-if="props.question.type === SCORE">
          选项个数：
          <a-select style="width: 200px" v-model:value="scoreOption" @change="scoreOptionChange">
            <a-select-option v-for="i in 10" :key="i" :value="i">{{ i }}个</a-select-option>
          </a-select>
        </div>
        <matrix-editor v-else-if="matrixOptionShow" :question="props.question" :index="props.index" @addRows="addRows"
          @removeRows="removeRows" @moveRows="moveRows" @addColumn="addColumn" @removeColumn="optionRemoveClick"
          @moveColumn="optionMoveClick"></matrix-editor>
        <sliderOption v-if="props.question.type === SLIDER || props.question.type === MATRIX_SLIDER"
          :min="props.question.option[0]" :max="props.question.option[1]" @change="sliderChange"></sliderOption>
        <div class="logic-set flex align-items">
          <span>逻辑设置：</span>
          <a @click="concernClick(1)">题目向前关联</a>
          <a @click="concernClick(2)">复制向前关联</a>
          <a @click="concernClick(3)"
            v-if="props.question.type === RADIO || props.question.type === CHECKBOX || props.question.type === DROP">选项关联</a>
        </div>
        <a-button type="primary" block size="large" @click="questionnaire.resetting()">完成编辑</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, type PropType } from "vue";
import type { questionType, controlLogicType } from "@/types/index";
import { Modal, message } from "ant-design-vue";
import { questionnaireStore } from "@/stores/questionnaire";
import RichTinymce from "./rich-tinymce.vue";
import slider from "@/components/slider/slider.vue";
import sliderOption from "./item-module/slider-option.vue";
import matrixEditor from "./item-module/matrix-editor.vue";
import matrixItem from "@/components/matrix-item/matrix-item.vue";
import { typeEnum, validateOption } from "@/assets/common/enums";
const { RADIO, CHECKBOX, DROP, SCORE, FILL, PAGING, PARAGRAPH, SLIDER, MATRIX_RADIO, MATRIX_CHECKBOX, MATRIX_SLIDER } = typeEnum;

const questionnaire = questionnaireStore();
const emit = defineEmits(["optionAdd", "concern"]);
const editorType = [RADIO, CHECKBOX, FILL];

const props = defineProps({
  question: {
    type: Object as PropType<questionType>,
    default: {},
  },
  index: {
    type: Number,
    default: 0,
  },
  serialNum: {
    type: Number,
    default: 0,
  },
  insertNum: {
    type: Number,
    default: -1,
  },
  showConcern: {
    type: String,
    default: "",
  },
  optionLogic: {
    type: Array as PropType<controlLogicType[]>,
    default: [],
  },
});

let radioData = ref("");
const mustBoolean = ref<boolean>(props.question.must == 1 ? true : false);
const typeRadio = ref<typeEnum>(props.question.type);
const scoreOption = ref(props.question.option.length);

function generateColumn(column: number) {
  return { "grid-template-columns": `repeat(${column}, minmax(0, 1fr))` };
}

//基础选项调整显示
const basicsOptionShow = computed(() => {
  return [RADIO, CHECKBOX, DROP, SCORE].includes(props.question.type);
});

const matrixOptionShow = computed(() => {
  return [MATRIX_RADIO, MATRIX_CHECKBOX, MATRIX_SLIDER].includes(props.question.type);
});

//插入数据
const insertClick = () => {
  let index = props.index;
  if (index === props.insertNum) index = -2;
  questionnaire.insert(index);
};
//复制
const copyClick = () => {
  const copy = { ...props.question };
  questionnaire.copy(copy, props.index);
};
//删除
const erasureClick = () => {
  Modal.confirm({
    title: "提示",
    content: `确认删除？`,
    okText: "确认",
    cancelText: "取消",
    onOk() {
      const id = props.question.id;
      const controlLogic = questionnaire.controlLogic.filter((item) => item.childId === id || item.questionIds.includes(String(id)));
      const controlOption = questionnaire.controlOption.filter((item) => item.childId === id || item.questionIds.includes(String(id)));
      //判断是否有逻辑关联
      if (controlLogic.length || controlOption.length) {
        Modal.confirm({
          title: "提示",
          content: `题目有关联控制逻辑，删除题目，和题目相关的逻辑控制会删除，是否继续？`,
          okText: "确认",
          cancelText: "取消",
          onOk() {
            questionnaire.erasure(id, props.index);
          },
        });
      } else {
        questionnaire.erasure(id, props.index);
      }
    },
  });
};
//移动
const moveClick = (action: string) => {
  questionnaire.move(props.index, action);
};
//点击编辑
const editClick = () => {
  questionnaire.editCount(props.question.id);
};
//点击必答
const checkboxChange = () => {
  questionnaire.mustSelect(props.index, mustBoolean.value);
};
//切换类型
const typeChange = () => {
  Modal.confirm({
    title: "提示",
    content: `是否将${props.question.type}题改为${typeRadio.value}题？`,
    okText: "确认",
    cancelText: "取消",
    onOk() {
      if (typeRadio.value === FILL) {
        const id = props.question.id;
        const controlLogic = questionnaire.controlLogic.filter((item) => item.childId === id || item.questionIds.includes(String(id)));
        const controlOption = questionnaire.controlOption.filter((item) => item.childId === id || item.questionIds.includes(String(id)));
        //判断是否有逻辑关联
        if (controlLogic.length || controlOption.length) {
          Modal.confirm({
            title: "提示",
            content: `题目有关联控制逻辑，修改题目类型，和题目相关的逻辑控制会删除，是否继续？`,
            okText: "确认",
            cancelText: "取消",
            onOk() {
              questionnaire.typeModify(props.index, typeRadio.value, id);
            },
            onCancel() {
              typeRadio.value = props.question.type;
            },
          });
        } else {
          questionnaire.typeModify(props.index, typeRadio.value);
        }
      } else {
        questionnaire.typeModify(props.index, typeRadio.value);
      }
    },
    onCancel() {
      typeRadio.value = props.question.type;
    },
  });
};
//选项添加
const optionAddClick = (optionIndex: number) => {
  emit("optionAdd", { index: props.index, optionIndex });
};
//选项移除
const optionRemoveClick = (optionIndex: number, optionId: number) => {
  if (props.question.option.length > 1) {
    const id = props.question.id;
    let bool = false;
    // 判断是否存在逻辑
    for (const item of questionnaire.controlLogic) {
      const questionIdsArray = item.questionIds.split(",");
      const idIndex = questionIdsArray.indexOf(String(id));
      if (idIndex !== -1) {
        bool = item.parentAnswer.split("|")[idIndex].split(",").includes(String(optionId));
        if (bool) break;
      }
    }
    // 判断是存在选项关联逻辑
    if (!bool) {
      for (const item of questionnaire.controlOption) {
        if (item.childId === id && item.optionId === optionId) {
          bool = true;
          break;
        }
        const questionIdsArray = item.questionIds.split(",");
        const idIndex = questionIdsArray.indexOf(String(id));
        if (idIndex !== -1) {
          bool = item.parentAnswer.split("|")[idIndex].split(",").includes(String(optionId));
          if (bool) break;
        }
      }
    }
    //判断是否有逻辑关联
    if (bool) {
      Modal.confirm({
        title: "提示",
        content: `题目选项有关联控制逻辑，删除选项，和题目相关的逻辑控制会删除，是否继续？`,
        okText: "确认",
        cancelText: "取消",
        onOk() {
          questionnaire.optionRemove(props.index, optionIndex, optionId);
        },
      });
    } else {
      questionnaire.optionRemove(props.index, optionIndex);
    }
  } else {
    const text = props.question.children.length === 0 ? "不能删除所有选项" : "不能删除所有列";
    message.warning(text);
  }
};
//选项移动
const optionMoveClick = (optionIndex: number, action: string) => {
  if (optionIndex == 0 && action == "上") return;
  questionnaire.optionMove(props.index, optionIndex, action);
};
//题目关联
const concernClick = (state: number) => {
  emit("concern", {
    index: props.index,
    id: props.question.id,
    title: props.question.title,
    state,
  });
};

//选项个数
const scoreOptionChange = (num: number) => {
  questionnaire.scoreOptionModify(props.index, num);
};

//选项逻辑控制
const optionLogicText = (id: number, control: controlLogicType[]) => {
  for (const item of control) {
    if (id === item.optionId) {
      return `（${questionnaire.logicText(item)}）`;
    }
  }
  return "";
};

// 数字输入框
const sliderChange = (optionIndex: number, value: number) => {
  questionnaire.question[props.index].option[optionIndex].id = value;
};

//添加行
const addRows = (rowsIndex: number) => {
  questionnaire.addRows(props.index, rowsIndex, props.question.children.length + 1);
}

//移动行
const moveRows = (rowsIndex: number, action: string) => {
  if (rowsIndex == 0 && action == "上") return;
  questionnaire.moveRows(props.index, rowsIndex, action);
}

//删除行
const removeRows = (rowsIndex: number) => {
  if (props.question.children.length > 1) {
    questionnaire.removeRows(props.index, rowsIndex);
  } else {
    message.warning("不能删除所有行");
  }
}

//添加列
const addColumn = (columnIndex: number) => {
  console.log(props.question.children);
  if (props.question.option.length < 5) {
    questionnaire.addColumn(props.index, columnIndex);
  } else {
    message.warning("最多只能添加5行");
  }
}

</script>
<style lang="scss" scoped>
.survey-item {
  font-size: 16px;
  padding: 10px;
  border-bottom: 1px solid #efefef;

  .show-concern {
    color: #808084;
    font-size: 14px;
    margin-top: 5px;
  }

  .survey-menu {
    height: 30px;
    line-height: 30px;
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
    content: "* ";
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

.item-logic {
  color: #efa030;
  font-size: 14px;
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
    margin: 10px 0;

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

.score-option {
  padding: 10px;
}

.logic-set {
  background: #e8e8e8;
  padding: 10px;
  margin-bottom: 15px;

  a {
    margin: 0 15px;

    &:hover {
      background: transparent;
    }
  }
}
</style>
