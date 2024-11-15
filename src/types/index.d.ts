import { typeEnum, validateEnum } from "@/assets/common/enums";

/**
 * 空件项
 * @param id id
 * @param title 控件标题
 * @param type 类型
 * @param icon 图标
 */
export declare type contrlType = {
  key: string;
  title: string;
  children: contrlChildrenType[];
};

/**
 * 空件项
 * @param key id
 * @param title 控件标题
 * @param type 类型
 * @param icon 图标
 */
export declare type contrlChildrenType = {
  key: string;
  title: string;
  type: typeEnum;
  icon: string;
};

/**
 * 选项
 * @param id id
 * @param content 内容
 */
export declare type optionType = {
  id: number;
  content: string;
};
/**
 * 问题
 * @param id id
 * @param title 标题
 * @param type 类型
 * @param option 选项
 * @param must 是否必选
 * @param column 选项列数
 * @param currentPage 当前页
 * @param chooseMin 选择最小
 * @param chooseMax 选择最大值
 * @param validateType 验证类型
 * @param isHide 是否隐藏
 */
export declare type questionType = {
  id: number;
  title: string;
  type: typeEnum;
  option: optionType[];
  must: 0 | 1;
  column: number;
  currentPage?: number;
  chooseMin: number;
  chooseMax: number;
  validateType: validateEnum;
  children?: questionType[];
  isHide:0 |1;
};

/**
 * 继承问题列表数据
 * @param isVisible 是否显示
 * @param hideNum 隐藏编号
 */
export declare type questionListType = questionType & {
  isVisible: boolean;
  hideNum: number[];
};

/**
 * 控制逻辑
 * @param questionIds 题目id
 * @param childId 子id (子id代表当前控制题目)
 * @param parentAnswer 题目答案
 * @param condition 且 | 或
 * @param optionId 选项id
 */
export declare type controlLogicType = {
  questionIds: string;
  childId: number;
  parentAnswer: string;
  condition: "and" | "or";
  optionId?: number;
};

/**
 * 选项控制
 * @param questionId 题目id
 * @param control 控制逻辑
 */
export declare type controlOptionType = {
  questionId: number;
  control: controlLogicType[];
};

declare type Nullable<T> = T | null;
/**
 * 问卷调查
 * @param id 问卷id
 * @param title 问卷标题
 * @param content 问卷说明
 * @param createTime 创建时间
 * @param modifyTime 修改时间
 * @param state 问卷状态
 * @param question 问卷题目
 * @param controlLogic 控制逻辑
 * @param controlOption 选项关联
 */
export declare type surveyType = {
  id: string;
  title: string;
  content: string;
  createTime: string;
  modifyTime: string;
  state: boolean;
  question: questionType[];
  controlLogic: controlLogicType[];
  controlOption: controlLogicType[];
};

/**
 * 问题控制
 * @param questionId 题目id
 * @param content 答案
 */
export declare type QuestionControlType = {
  id: number;
  parentIds: number[];
  condition: "and" | "or";
  parentAnswer: Array<number[]>;
  optionId?: number;
};

/**
 * 答案
 * @param questionId 题目id
 * @param content 答案
 */
export declare type answerType = {
  questionId: number;
  content: number | number[] | string;
};

/**
 * 调查答案
 * @param answerId 答案id
 * @param urveyId 调查id
 * @param surveyTitle 调查标题
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param consumTime 消耗时间
 * @param answer 答案内容
 */
export declare type surveyAnswerType = {
  answerId: string;
  surveyId: string;
  surveyTitle: string;
  startTime: string;
  endTime: string;
  consumTime: string;
  answer: answerType[];
};

/**
 * 用户信息
 * @param id 用户id
 * @param name 用户名称
 * @param avatar 用户头像
 */
export declare type userType = {
  id: string;
  name: string;
  avatar: string;
};

/**
 * 分析选项
 * @param count 总计
 * @param ratio 占比
 */
export declare type analysisOptionType = optionType & {
  count: number;
  ratio: number;
};

/**
 * 填空题数据
 * @param xh 序号
 * @param count 文本
 */
export declare type fillType = {
  xh: number;
  count: string;
};

/**
 * 数据分析
 * @param id 题目id
 * @param title 标题
 * @param type 类型
 * @param option 选项
 * @param fill 填空题数据
 * @param assessCount 总计
 */
export declare type analysisType = {
  id: number;
  title: string;
  type: typeEnum;
  option: analysisOptionType[];
  fill: fillType[];
  assessCount: number;
};

/**
 * 数据加载
 * @isLoading 是否开启加载页面
 * @start 开启
 * @end 关闭
 */
export declare type loadingType = {
  isLoading: boolean;
  start: (text?: string) => void;
  end: () => void;
};
