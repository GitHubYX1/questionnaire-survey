/** 题目类型 */
export enum typeEnum {
  /** 单选 */
  RADIO = "单选",
  /** 多选 */
  CHECKBOX = "多选",
  /** 下拉 */
  DROP = "下拉",
  /** 评分 */
  SCORE = "评分",
  /** 滑动条 */
  SLIDER = "滑动条",
  /** 填空 */
  FILL = "填空",
  /** 分页 */
  PAGING = "分页",
  /** 段落说明 */
  PARAGRAPH = "段落说明",
  /** 矩阵单选 */
  MATRIX_RADIO = '矩阵单选',
  /** 矩阵多选 */
  MATRIX_CHECKBOX = '矩阵多选',
  /** 矩阵滑动条 */
  MATRIX_SLIDER = '矩阵滑动条',
}

/** 验证类型 */
export enum validateEnum {
  /** 不校验 */
  DEFAULT = "",
  /** 身份证号 */
  ID_CARD = "ID",
  /** 手机号 */
  MOBILE = "tel",
  /** 固话 */
  TEL = "phone",
  /** 纯数字 */
  NUMBER = "number",
  /** 整数 */
  INTEGER="integer",
  /** QQ */
  QQ = "qq",
  /** 邮箱 */
  EMAIL = "mail",
}

export const validateOption = [
  { value: validateEnum.DEFAULT, label: "不校验" },
  { value: validateEnum.ID_CARD, label: "身份证号" },
  { value: validateEnum.MOBILE, label: "手机号" },
  { value: validateEnum.TEL, label: "固定电话" },
  { value: validateEnum.NUMBER, label: "数字" },
  { value: validateEnum.INTEGER, label: "整数" },
  { value: validateEnum.QQ, label: "QQ" },
  { value: validateEnum.EMAIL, label: "邮箱" },
];
