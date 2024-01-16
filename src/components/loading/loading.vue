<template>
  <div class="dv-loading">
    <div class="app-loading-wrap">
      <div class="app-loading-dots">
        <span class="dot dot-spin"><i></i><i></i><i></i><i></i><i></i></span>
      </div>
    </div>
    <div class="loading-tip">{{ text }}</div>
  </div>
</template>

<script lang="ts">
export default { name: "loading" };
</script>

<script lang="ts" setup>
defineProps({
  text: {
    type: String,
    default: "数据加载中...",
  },
});
</script>

<style lang="scss" scoped>
.dv-loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99999;
  background-color: rgba(0, 0, 0, 0.4);

  .app-loading-wrap {
    position: absolute;
    top: 43%;
    left: 50%;
    display: flex;
    transform: translate3d(-50%, -50%, 0);
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .dots {
    display: flex;
    padding: 98px;
    justify-content: center;
    align-items: center;
  }

  .dot {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 48px;
    margin-top: 30px;
    font-size: 32px;
    transform: rotate(45deg);
    box-sizing: border-box;
    animation: antRotate 1.2s infinite linear;
  }

  .dot i {
    position: absolute;
    display: block;
    width: 20px;
    height: 20px;
    background-color: #1C7AFF;
    border-radius: 100%;
    opacity: 30%;
    transform: scale(0.75);
    animation: antSpinMove 1s infinite linear alternate;
    transform-origin: 50% 50%;
  }

  .dot i:nth-child(1) {
    top: 0;
    left: 0;
  }

  .dot i:nth-child(2) {
    top: 0;
    right: 0;
    animation-delay: 0.4s;
  }

  .dot i:nth-child(3) {
    right: 0;
    bottom: 0;
    animation-delay: 0.8s;
  }

  .dot i:nth-child(4) {
    bottom: 0;
    left: 0;
    animation-delay: 1.2s;
  }

  .loading-tip {
    padding: 15px;
    font-size: 22px;
    color: #fff;
  }

  @keyframes antRotate {
    to {
      transform: rotate(405deg);
    }
  }

  @keyframes antSpinMove {
    to {
      opacity: 100%;
    }
  }
}
</style>
