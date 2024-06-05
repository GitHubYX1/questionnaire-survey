import { typeEnum } from "./enums";

// 控件列表
export const contrlList = [
  {
    key: "1",
    title: "选择题",
    children: [
      {
        key: "1-1",
        title: "单选题",
        type: typeEnum.RADIO,
        icon: "radio-outlined",
      },
      {
        key: "1-2",
        title: "多选题",
        type: typeEnum.CHECKBOX,
        icon: "check-square-outlined",
      },
      {
        key: "1-3",
        title: "下拉题",
        type: typeEnum.DROP,
        icon: "caret-down-filled",
      },
      {
        key: "1-4",
        title: "评分题",
        type: typeEnum.SCORE,
        icon: "star-outlined",
      },
      {
        key: "1-5",
        title: "滑动条",
        type: typeEnum.SLIDER,
        icon: "slider-outlined",
      },
    ],
  },
  {
    key: "2",
    title: "填空题",
    children: [
      {
        key: "2-1",
        title: "填空题",
        type: typeEnum.FILL,
        icon: "edit-outlined",
      },
      {
        key: "2-2",
        title: "简答题",
        type: typeEnum.FILL,
        icon: "profile-outlined",
      },
    ],
  },
  {
    key: "3",
    title: "分页说明",
    children: [
      {
        key: "3-1",
        title: "分页",
        type: typeEnum.PAGING,
        icon: "column-height-outlined",
      },
      {
        key: "3-2",
        title: "段落说明",
        type: typeEnum.PARAGRAPH,
        icon: "edit-outlined",
      },
    ],
  },
  {
    key: "4",
    title: "矩阵题",
    children: [
      {
        key: "4-1",
        title: "矩阵单选",
        type: typeEnum.MATRIX_RADIO,
        icon: "matrix-radio-outlined",
      },
      {
        key: "4-2",
        title: "矩阵多选",
        type: typeEnum.MATRIX_CHECKBOX,
        icon: "matrix-checkbox-outlined",
      },
      {
        key: "4-3",
        title: "矩阵滑动条",
        type: typeEnum.MATRIX_SLIDER,
        icon: "matrix-slider-outlined",
      },
    ],
  },
];
