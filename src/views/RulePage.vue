<template>
  <div class="warper">
    <el-card class="rule-card">
      <template #header>
        <div class="card-header">
          <el-text type="primary" size="large">代理分组规则</el-text>
        </div>
      </template>
      <RuleSelector module="proxyRules" />
    </el-card>
    <el-card class="rule-card">
      <template #header>
        <div class="card-header">
          <el-text type="primary" size="large">直连分组规则</el-text>
        </div>
      </template>
      <RuleSelector module="directRules" />
    </el-card>
    <el-card class="rule-card">
      <template #header>
        <div class="card-header">
          <el-text type="primary" size="large">拦截分组规则</el-text>
        </div>
      </template>
      <RuleSelector module="blockRules" />
    </el-card>
    <el-card class="rule-card">
      <template #header>
        <div class="card-header">
          <el-text type="primary" size="large">自定义分组规则</el-text>
        </div>
      </template>
      <RuleCreater />
    </el-card>
  </div>
</template>

<script setup>
import RuleSelector from "@/components/RuleSelector.vue";
import RuleCreater from "@/components/RuleCreater.vue";

import { onMounted } from "vue";
import { useStore } from 'vuex';


const store = useStore();

onMounted(() => {
  store.dispatch('profile/initProfile');
});
</script>

<style scoped>
.warper {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.rule-card {
  min-width: 420px;
  width: 49%;
  margin-bottom: 20px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}
</style>
