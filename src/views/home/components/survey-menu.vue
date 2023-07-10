<template>
    <a-menu :openKeys="state.openKeys" :selectedKeys="state.selectedKeys" mode="vertical" @click="handleClick">
        <a-menu-item key="/home">
            <template #icon>
                <home-outlined />
            </template>
            首页
        </a-menu-item>
        <a-menu-item key="/project">
            <template #icon>
                <hdd-outlined />
            </template>
            我的项目
        </a-menu-item>
    </a-menu>
</template>
<script lang="ts" setup>
import { reactive,onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    HomeOutlined,
    HddOutlined
} from '@ant-design/icons-vue';
import type { MenuProps } from 'ant-design-vue';

const router = useRouter()
const state = reactive<any>({
    selectedKeys: [],
    openKeys: [],
});

onMounted(()=>{
    state.selectedKeys = [router.currentRoute.value.path]
    state.openKeys = [router.currentRoute.value.path]
})

const handleClick: MenuProps['onClick'] = menuInfo => {
    state.selectedKeys = menuInfo.keyPath
    state.openKeys = menuInfo.keyPath
    if(menuInfo.keyPath&&menuInfo.keyPath[0]){
        router.push(''+menuInfo.keyPath[0])
    }
}
</script>
  
  