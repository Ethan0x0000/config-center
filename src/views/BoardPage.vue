<template>
  <el-card shadow="always" style="margin-bottom: 20px;">
    <div class="user-info">
      <el-text style="width:80px;">后端地址:</el-text>
      <el-input class="input-box" v-model="backendUrl" size="default" placeholder="请输入地址" />
    </div>
    <div class="kernel-info">
      <div class="kernel-status">
        <el-text style="width:80px;">内核状态: </el-text>
        <el-text :type="kernelStatus.type">{{ kernelStatus.text }}</el-text>
      </div>
      <div class="kernel-version">
        <el-text>版本: {{ kernelVersionInfo.current }}</el-text>
        <el-text v-if="kernelVersionInfo.current !== kernelVersionInfo.latest"> 可更新至:
          {{ kernelVersionInfo.latest }}</el-text>
      </div>
    </div>
  </el-card>
  <el-card shadow="hover">
    <template #header>
      <el-text type="primary" size="large" style="display: flex; justify-content: center;">指令集合</el-text>
    </template>
    <div class="action-btn">
      <el-button type="primary" @click="restartKernel" :loading="restartState"
        style="display: flex;justify-content: center;align-items: center;width: 49%;height: 40px; margin:0px 0px 5px 0px;">重启内核</el-button>
      <el-button type="primary" @click="upgradeKernel" :loading="upgradeState"
        style="display: flex;justify-content: center;align-items: center;width: 49%;height: 40px; margin:0px 0px 5px 0px;">升级内核</el-button>
      <el-button type="primary" @click="reloadRuleSets" :loading="reloadState"
        style="display: flex;justify-content: center;align-items: center;width: 49%;height: 40px; margin:0px 0px 5px 0px;">重载规则集列表</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

const store = useStore();

const backendUrl = computed({
  get: () => store.state.user.backendUrl,
  set: (value) => store.commit('user/setBackendUrl', value)
});

const kernelStatus = computed(() => store.state.user.kernelStatus);
const kernelVersionInfo = computed(() => store.state.user.kernelVersionInfo);

let intervalId = null;

onMounted(() => {
  store.dispatch('profile/initProfile');


  intervalId = setInterval(() => {
    store.dispatch('user/getKernelStatus');
  }, 3000);
  store.dispatch('user/getKernelVersionInfo');
});

onUnmounted(() => {
  clearInterval(intervalId);
});


const restartState = ref(false);
const restartKernel = async () => {
  restartState.value = true;
  try {
    const res = await axios.post(`http://${backendUrl.value}/restart-kernel`);
    if (res.status === 200) {
      ElMessage.success(`重启内核成功`);
    } else {
      ElMessage.error(`重启内核失败: ${res.data}`);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('重启内核失败');
  }
  restartState.value = false;
};

const upgradeState = ref(false);
const upgradeKernel = async () => {
  upgradeState.value = true;
  try {
    const res = await axios.post(`http://${backendUrl.value}/upgrade-kernel`);
    if (res.status === 200) {
      ElMessage.success(`升级内核成功`);
    } else {
      ElMessage.error(`升级内核失败: ${res.data}`);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('升级内核失败');
  }
  upgradeState.value = false;
};

const reloadState = ref(false);
const reloadRuleSets = async () => {
  reloadState.value = true;
  try {
    store.dispatch('rule_sets/fetchRuleSets');
    ElMessage.success('规则集列表已重新加载');
  } catch (error) {
    console.error(error);
    ElMessage.error('规则集列表加载失败');
  }
  reloadState.value = false;
};


</script>

<style scoped>
.user-info {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  margin-bottom: 20px;
}

.kernel-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
}

.action-btn {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
}
</style>