<template>
    <div class="data-header flex-between align-items">
        <div class="data-source">{{ title }}</div>
        <div class="anv-list flex align-items">
            <div :class="['anv-item', selectedKe() == '/data/analysis' ? 'select' : '']"
                @click="routerPush('/data/analysis')">
                <PieChartOutlined />
                <div>数据分析</div>
            </div>
            <div :class="['anv-item', selectedKe() == '/data/answer' ? 'select' : '']" @click="routerPush('/data/answer')">
                <LaptopOutlined />
                <div>答题数据</div>
            </div>
        </div>
        <a-tooltip placement="退出">
            <div class="option flex align-items" @click="quit">
                <export-outlined />
                <span>返回</span>
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { surveyStore } from "@/stores/survey";

const router = useRouter();
const storeData = surveyStore();
const title = ref("");

onMounted(() => {
    let surveyId = storeData.surveyId;
    if (surveyId) {
        let survey = storeData.surveySelected(surveyId);
        console.log("survey", survey);
        title.value = survey.title;
    }
})

const selectedKe = () => {
    return router.currentRoute.value.path
}

const routerPush = (path: string) => {
    router.push(path);
}

const quit = () => {
    router.replace("/project");
};
</script>
<style lang="scss" scoped>
.data-header {
    height: 100%;
    position: relative;
}

.data-source {
    width: 380px;
    border: 1px solid #D9D9D9;
    border-radius: 5px;
    line-height: 35px;
    padding: 0 15px;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
}

.anv-list {
    height: 100%;
    position: absolute;
    left: 50%;
    transform: translate(-50%,0);

    .anv-item {
        height: 100%;
        padding: 0 20px;
        cursor: pointer;
        text-align: center;
        line-height: normal;
        font-size: 14px;

        span {
            font-size: 26px;
            margin: 6px;
        }

        &:hover {
            background: #F7F7F7;
        }
    }

    .select {
        background: #1890ff;
        color: #fff;

        &:hover {
            background: #1890ff;
        }
    }
}



.option {
    cursor: pointer;
    font-size: 18px;

    >span {
        margin-left: 10px;
    }
}
</style>