<template>
  <a-modal :visible="frontVisible" title="题目向前关联" width="800px" :mask="false" @cancel="onCancel" @ok="handleOk">
    <div class="front-box">
      <div class="front-title flex">
        <div class="front-text">当前题目：</div> {{ titleText }}
      </div>
      <a-form layout="vertical" class="front-list" :model="formFront" ref="formFrontRef">
        <div class="front-item" v-for="(item, index) in concernData" :key="index">
          <div class="front-title flex">
            <div class="front-text">关联题目{{ index + 1 }}:</div>
            <div class="front-search">
              <a-select v-model:value="item.value" show-search :options="options" @select="select(index, $event)"
                style="width: 90%" :filter-option="filterOption" />
              <span v-if="index == 0" @click="frontAdd">+更多</span>
              <span v-else @click="frontCancel(index, item.id)">-取消</span>
            </div>
          </div>
          <div class="front-option" v-if="item.option.length">
            <div class="front-tip">
              <p>当“关联题目{{ index + 1 }}”选择下面的选项：</p>
              <a-button size="small" @click="invert(index, item.id)">反选</a-button>
            </div>
            <a-form-item>
              <a-checkbox-group v-model:value="formFront[item.id]">
                <a-checkbox class="flex front-checkbox" v-for="subItem in item.option" :key="subItem.id"
                  :value="Number(subItem.id)" :name="subItem.content">{{ subItem.content }}</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </div>
        </div>
      </a-form>
      <div class="front-radio" v-if="concernData.length > 1">
        <div class="front-title flex">
          <div class="front-text">关联多题时：</div> <span>多题（每个矩阵行标题视为一题）间</span>
        </div>
        <div class="front-option">
          <a-radio-group v-model:value="conditionValue" name="radioGroup">
            <a-radio value="and"> 为“且”的关系</a-radio>
            <a-radio value="or"> 为“或”的关系</a-radio>
          </a-radio-group>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { message } from "ant-design-vue";
import type { optionType, questionType, controlLogicType } from "@/types/index";

interface selectType {
  value: number;
  label: string;
}

interface concernType {
  value: string;
  id: number;
  option: optionType[]
}

const frontVisible = ref(false);
const questions = ref<questionType[]>([]);
const titleText = ref('')
const options = ref<selectType[]>([])
const formFront = ref<Record<number, number[]>>({});
const childId = ref<number>(0)
const concernData = ref<concernType[]>([])
const conditionValue = ref<'and' | 'or'>('and')

const emit = defineEmits(['getFront'])

const filterOption = (input: string, option: selectType) => {
  return option.label.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};

// 打开
const frontOpen = (data: questionType[], title: string, id: number, controlLogic: controlLogicType | undefined) => {
  data = data.map((item, index) => { item.title = (index + 1) + '.' + item.title; return item }).filter(item => item.type !== '填空');
  if (data.length === 0) return message.info("此题前面没有选项题，无法设置关联逻辑！");
  frontVisible.value = true;
  concernData.value = [{
    value: '',
    id: 0,
    option: []
  }];
  formFront.value = {};
  questions.value = data;
  titleText.value = title;
  childId.value = id;
  conditionValue.value = 'and';
  options.value = data.map(item => { return { value: item.id, label: item.title } });
  if (controlLogic) {
    console.log('打印当前逻辑', controlLogic)
    conditionValue.value = controlLogic.condition;
    let questionIds = controlLogic.questionIds.split(',').map(item => Number(item))
    let parentAnswer = controlLogic.parentAnswer.split('|').map((item: string) =>
      item.split('、').map((id) => Number(id)),
    );
    let option: Record<string, number[]> = {}
    let concernList: concernType[] = data.flatMap(item => questionIds.indexOf(item.id) !== -1 ? { value: item.title, id: item.id, option: item.option } : []);
    for (let i in questionIds) {
      option[questionIds[i]] = parentAnswer[i]
    }
    concernData.value = concernList
    formFront.value = option
  }
}
//取消
const onCancel = (e: any) => {
  if (e.target.className != "ant-modal-wrap") frontVisible.value = false;
};
//反选
const invert = (index: number, id: number) => {
  let option = concernData.value[index].option
  let front = formFront.value[id]
  if (!front || front.length == 0) {
    formFront.value[id] = option.map(item => item.id)
  } else {
    formFront.value[id] = option.filter(item => front.indexOf(item.id) === -1).map(item => item.id)
  }
}
//新增
const frontAdd = () => {
  if (concernData.value.length == options.value.length) return message.info("已超过可关联题目数量！");
  concernData.value.push({
    value: '',
    id: concernData.value.length + 1,
    option: []
  })
}
//取消
const frontCancel = (index: number, id: number) => {
  concernData.value.splice(index, 1);
  delete formFront.value[id]
}

//选择数据
const select = (index: number, value: number) => {
  if (concernData.value[index].id === value) return
  let ids = concernData.value.map(item => item.id).indexOf(value)
  if (ids !== -1) {
    concernData.value[index].value = questions.value.find(item => item.id == concernData.value[index].id)?.title || '';
    return message.info("关联题目不能重复");
  }
  let data = questions.value.find(item => item.id == value)
  concernData.value[index].id = value
  concernData.value[index].option = data?.option || []
  if(concernData.value.length == 1){
    formFront.value = {}
  }else{
    delete formFront.value[value]
  }
}

//确定
const handleOk = () => {
  let ids: string[] = [];
  let parentAnswer = [];
  let from = formFront.value
  for (let i in from) {
    if (from[i].length) {
      ids.push(i)
      parentAnswer.push(from[i].join('、'))
    }
  }
  let control: controlLogicType = {
    questionIds: ids.join(),
    childId: childId.value,
    parentAnswer: parentAnswer.join('|'),
    condition: conditionValue.value,
  }
  emit("getFront", control)
  frontVisible.value = false
}

defineExpose({ frontOpen })
</script>
<style lang="scss" scoped>
.front-box {
  font-size: 16px;
  max-height: 400px;
  overflow-y: auto;

  .front-text {
    width: 100px;
    font-size: 16px;
  }

  .front-tip {
    font-size: 16px;

    p {
      padding: 6px 0;
    }
  }

  .front-list {
    margin-top: 15px;

    .front-item {
      margin-bottom: 15px;
    }
  }

  .front-search {
    width: calc(100% - 100px);

    >span {
      color: #999999;
      margin-left: 20px;
      cursor: pointer;

      &:hover {
        color: #333333;
      }
    }
  }
}

.ant-checkbox-group {
  width: 100%;
}

.front-option {
  margin-left: 100px;

  .front-checkbox {
    width: 100%;
    margin: 0;
    font-size: 16px;
    padding: 0 10px;

    &:hover {
      background: #f9f9f9;
    }
  }
}
</style>