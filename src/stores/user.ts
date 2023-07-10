import { ref } from "vue";
import { defineStore } from "pinia";
import type { userType } from "@/types/index";
import storage from "@/utils/storage";

export const userStore = defineStore("user", () => {
    const userData = ref<userType>({
        id:'trccaXP7y',
        name:'管理员',
        avatar:'',
    })
    return {userData}
})