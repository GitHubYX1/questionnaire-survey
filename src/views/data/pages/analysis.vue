<template>
  <a-card>
    <a-skeleton active :paragraph="{ rows: 10 }"></a-skeleton>
  </a-card>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { surveyStore } from "@/stores/survey";
import { getAnalysisData } from "@/computed/api";

const storeData = surveyStore();

watch(() => storeData.surveyId, async(id) => {
   let data=await getAnalysisData(id);   
}, { immediate: true })
</script>
<style lang="scss" scoped></style>