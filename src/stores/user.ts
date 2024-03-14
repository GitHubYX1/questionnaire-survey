import { ref } from "vue";
import { defineStore } from "pinia";
import type { userType } from "@/types/index";
import logo from "../assets/logo.svg"

export const userStore = defineStore("user", () => {
    const userData = ref<userType>({
        id:'trccaXP7y',
        name:'管理员',
        avatar:logo,
    })
    return {userData}
})