/** 校验是否为手机号 */
export function isMobile(mobile: string) {
  return /^((\+|00)86)?1((3[\d])|(4[5,6,7,9])|(5[0-3,5-9])|(6[5-7])|(7[0-8])|(8[\d])|(9[1,8,9]))\d{8}$/.test(mobile);
}

/** 校验是否为身份证号 */
export function isIdCard(idCard: string) {
  return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(idCard);
}

/** 校验是否为邮箱 */
export function isEmail(email: string) {
  return /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(email);
}

/** 校验是否为QQ */
export function isQQ(qq: string) {
  return /^[1-9]\d{4,10}$/.test(qq);
}

/** 校验是否为固话 */
export function isTel(tel: string) {
  return /^(0\d{2,3}-\d{7,8})|(1[3584]\d{9})$/.test(tel);
}

/** 校验是否为数字 */
export function isNumber(number: string) {
  return !isNaN(Number(number));
}

/** 校验是否为整数 */
export function isInteger(number: string) {
  return /^\d+$/.test(number);
}
