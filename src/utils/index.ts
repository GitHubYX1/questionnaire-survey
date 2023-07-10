import dayjs from 'dayjs';

//获取最大值
export function mostValue(arr: any[], value: string): number {
  return (
    arr.reduce(function (max, obj) {
      return Math.max(max, obj[value]);
    }, 0) + 1
  );
}

// 计算时间戳
export function offTime(value: number): string {
  if (!value) return "";
  var date = new Date(value);
  var Y = date.getFullYear() + "-";
  var M =
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) + "-";
  var D = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  var h =
      (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
    var m =
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  return Y + M + D + ' ' + h + m;
}

//获取时间
export function getTime():string {
  const timeFormat = 'YYYY-MM-DD HH:mm:ss';
  return dayjs().format(timeFormat);
}

//获取时间差
export function timeDiff(start:string,end:string){
  let leave1 = new Date(start).getTime()
  let leave2 = new Date(end).getTime()
  let leave3= (leave2 - leave1)/ 1000
  var minute = Math.floor(leave3 / 60)
  var second = leave3 % 60 
  if(minute){
    return `${minute}分${second}秒`
  }else{
    return `${second}秒`
  }
}