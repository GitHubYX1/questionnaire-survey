export default {
  isObject(value: any) {
    return Object.prototype.toString.call(value) === "[object Object]";
  },
  /**
   * 设置localStorage
   * @param key 关键字
   * @param value 值
   * @param subKey 二级key
   */
  setSession(key: string, value: any, subKey?: string) {
    if (subKey) {
      const obj = this.getSession(key);
      if (!this.isObject(obj)) return console.error(`${key} 不是对象存储`);
      obj[subKey] = value;
      this.setSession(key, obj);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
  /**
   * 获取localStorage
   * @param key 关键字
   * @param subKey 二级key
   */
  getSession(key: string, subKey?: string) {
    if (subKey) {
      const obj: any = this.getSession(key);
      if (!this.isObject(obj)) return '';
      return obj[subKey] || null;
    }
    const value: any = localStorage.getItem(key);
    return JSON.parse(value);
  },
  /**
   * 删除二级key
   * @param key 关键字
   * @param subKey 二级key
   */
  subKeyDelete(key:string,subkey:string){
    const obj = this.getSession(key);
    for(let i in obj){
      if(i == subkey)
        delete obj[i]
    }
    this.setSession(key, obj);
  }
};
