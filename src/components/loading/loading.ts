import { createVNode, render } from "vue";
import Zloading from "./loading.vue";

export const loading = {
    isLoading: false,
    box: document.createElement('div'),
    /**
     * 启动加载中
     * @param text 加载显示文本
     */
    start(text?: string) {
      if (!this.isLoading) {
        document.body.appendChild(this.box)
        const vnode = createVNode(Zloading, { text })
        render(vnode, this.box)
        this.isLoading = true
      }
    },
  
    /**
     * 结束加载中
     */
    end() {
      if (this.isLoading) {
        document.body.removeChild(this.box)
        this.isLoading = false
      }
    }
  }