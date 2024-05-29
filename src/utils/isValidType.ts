//校验是否为整数
export function isValidNumber(value: number): boolean {
  return typeof value === "number" && value % 1 === 0 && value >= 0 && value <= 100;
}