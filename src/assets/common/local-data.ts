import { type contrlType } from "../../types/index";

// 控件列表
export const contrlList:contrlType[] = [
  {
    key: '0',
    title: "选择题",
    children: [
      {
        key: '0-1',
        title: "单选题",
        type: "单选",
        icon: "check-circle-outlined",
      },
      {
        key: '0-2',
        title: "多选题",
        type: "多选",
        icon: "check-square-outlined",
      },
      {
        key: '0-3',
        title: "下拉题",
        type: "下拉",
        icon: "caret-down-filled",
      },
      {
        key: '0-4',
        title: "评分题",
        type: "评分",
        icon: "star-outlined",
      },
    ],
  },
  {
    key: '1',
    title: "填空题",
    children: [
      {
        key: '1-1',
        title: "填空题",
        type: "填空",
        icon: "edit-outlined",
      },
    ],
  },
  {
    key: '2',
    title: "分页说明",
    children: [
      {
        key: '2-1',
        title: "段落说明",
        type: "段落说明",
        icon: "edit-outlined",
      },
    ],
  },
];
