export declare type typeType = "单选" | "多选" | "填空" | "段落说明";

/**
 * 空件项
 * @param id id
 * @param title 控件标题
 * @param type 类型
 * @param icon 图标
 */
export declare type contrlType = {
  id: number;
  title: string;
  type: typeType;
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
 */
export declare type questionType = {
  id: number;
  title: string;
  type: typeType;
  option: optionType[];
  must: 0 | 1;
  column: number
};

/**
 * 控制逻辑
 * @param questionIds 题目id
 * @param childId 子id (子id代表当前控制题目)
 * @param parentAnswer 题目答案
 * @param condition 且 | 或
 */
export declare type controlLogicType = {
  questionIds:string,
  childId:number,
  parentAnswer:string,
  condition:'and' | 'or',
}

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
 */
export declare type surveyType = {
  id: string;
  title: string;
  content: string;
  createTime: string;
  modifyTime: string;
  state: boolean;
  question: questionType[];
  controlLogic:controlLogicType[]
};

/**
 * 问题控制
 * @param questionId 题目id
 * @param content 答案
 */
export declare type QuestionControlType = {
  id:number;
  parentIds:number[],
  condition:'and' | 'or',
  parentAnswer:Array<number[]>
}

/**
 * 答案
 * @param questionId 题目id
 * @param content 答案
 */
export declare type answerType = {
  questionId:number;
  content:number | number[] | string
}

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
  answerId:string;
  surveyId:string,
  surveyTitle:string,
  startTime:string;
  endTime:string;
  consumTime:string;
  answer:answerType[]
}

/**
 * 用户信息
 * @param id 用户id
 * @param name 用户名称
 * @param avatar 用户头像
 */
export declare type userType = {
  id:string;
  name:string;
  avatar:string;
}