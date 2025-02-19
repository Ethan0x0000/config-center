<template>
  <div class="board-container">
    <!-- Header Section with Backend URL -->
    <el-row class="mb-4">
      <el-col :span="24">
        <el-card shadow="hover" class="url-card">
          <el-input v-model="backendUrl" size="large" placeholder="请输入后端地址" :prefix-icon="Connection">
            <template #prepend>后端地址</template>
          </el-input>
        </el-card>
      </el-col>
    </el-row>

    <!-- Status Dashboard -->
    <el-row :gutter="24" class="mb-4">
      <el-col :span="8">
        <el-card shadow="hover" class="status-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <span>内核状态</span>
                <el-button type="default" :icon="Refresh" circle size="small" @click="refreshStatus"
                  :loading="refreshState" class="refresh-btn" />
              </div>
              <el-tag :type="kernelStatus.type === 'success' ? 'success' : 'danger'" size="small" effect="dark">
                {{ kernelStatus.text }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="1" border class="status-descriptions">
            <el-descriptions-item label="当前版本">
              {{ kernelVersionInfo.current }}
            </el-descriptions-item>
            <el-descriptions-item label="最新版本">
              <div class="core-version-info">
                <span>{{ kernelVersionInfo.latest }}</span>
                <el-button v-if="kernelVersionInfo.current !== kernelVersionInfo.latest" type="warning" size="small"
                  class="upgrade-btn" @click="upgradeKernel" :loading="upgradeState" plain>
                  <el-icon class="mr-1">
                    <ArrowUpBold />
                  </el-icon>
                  升级
                </el-button>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span>内核控制</span>
            </div>
          </template>

          <el-row :gutter="24">
            <el-col :span="8">
              <el-button type="primary" :icon="VideoPlay" @click="restartKernel" :loading="restartState"
                class="control-btn">
                启动内核
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button type="danger" :icon="VideoPause" @click="stopKernel" :loading="stopState" class="control-btn">
                停止内核
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button type="info" :icon="Document" @click="showServiceLogs" class="control-btn">
                查看日志
              </el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- Utility Functions -->
    <el-row class="mb-4">
      <el-col :span="24">
        <el-card shadow="hover" class="util-card">
          <template #header>
            <div class="card-header">
              <span>其他功能</span>
            </div>
          </template>
          <el-space wrap size="large">
            <el-button type="primary" :icon="RefreshRight" @click="reloadRuleSets" :loading="reloadState">
              重载规则集列表
            </el-button>
            <el-button type="warning" :icon="Delete" @click="clearCache" :loading="clearingState">
              清除缓存
            </el-button>
          </el-space>
        </el-card>
      </el-col>
    </el-row>

    <!-- Logs Drawer -->
    <el-drawer v-model="logDrawerVisible" title="服务日志" size="50%" :destroy-on-close="true" class="log-drawer">
      <template #header>
        <div class="drawer-header">
          <span>服务日志</span>
          <el-button type="primary" :icon="Download" size="small" @click="downloadLogs" class="download-btn">
            导出日志
          </el-button>
        </div>
      </template>
      <el-scrollbar height="calc(100vh - 150px)">
        <pre class="log-content">{{ serviceLogs }}</pre>
      </el-scrollbar>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import {
  ArrowUpBold,
  Connection,
  Refresh,
  RefreshRight,
  Download,
  Document,
  Delete,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue';

const store = useStore();

// Computed properties
const backendUrl = computed({
  get: () => store.state.user.backendUrl,
  set: (value) => store.commit('user/setBackendUrl', value)
});

const kernelStatus = computed(() => store.state.user.kernelStatus);
const kernelVersionInfo = computed(() => store.state.user.kernelVersionInfo);

// State management
const restartState = ref(false);
const stopState = ref(false);
const upgradeState = ref(false);
const reloadState = ref(false);
const refreshState = ref(false);
const clearingState = ref(false);
const logDrawerVisible = ref(false);
const serviceLogs = ref('');

// Lifecycle hooks
onMounted(() => {
  store.dispatch('profile/initProfile');
});

// Methods
const restartKernel = async () => {
  restartState.value = true;
  try {
    const res = await axios.post(`http://${backendUrl.value}/restart-kernel`);
    if (res.status === 200) {
      ElMessage.success('重启内核成功');
      await refreshStatus();
    } else {
      ElMessage.error(`重启内核失败: ${res.data}`);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('重启内核失败');
  }
  restartState.value = false;
};

const stopKernel = async () => {
  stopState.value = true;
  try {
    const res = await axios.post(`http://${backendUrl.value}/stop-kernel`);
    if (res.status === 200) {
      ElMessage.success('停止内核成功');
      await refreshStatus();
    } else {
      ElMessage.error(`停止内核失败: ${res.data}`);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('停止内核失败');
  }
  stopState.value = false;
};

const upgradeKernel = async () => {
  if (kernelVersionInfo.value.current === kernelVersionInfo.value.latest) {
    ElMessage.warning('当前内核版本已是最新版本');
    return;
  }
  upgradeState.value = true;
  try {
    const res = await axios.post(`http://${backendUrl.value}/upgrade-kernel`);
    if (res.status === 200) {
      ElMessage.success('升级内核成功');
      await refreshStatus();
    } else {
      ElMessage.error(`升级内核失败: ${res.data}`);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('升级内核失败');
  }
  upgradeState.value = false;
};

const refreshStatus = async () => {
  refreshState.value = true;
  try {
    await store.dispatch('user/getKernelStatus');
    await store.dispatch('user/getKernelVersionInfo');
    ElMessage.success('状态已刷新');
  } catch (error) {
    console.error(error);
    ElMessage.error('状态刷新失败');
  }
  refreshState.value = false;
};

const reloadRuleSets = async () => {
  reloadState.value = true;
  try {
    await store.dispatch('rule_sets/fetchRuleSets');
    ElMessage.success('规则集列表已重新加载');
  } catch (error) {
    console.error(error);
    ElMessage.error('规则集列表加载失败');
  }
  reloadState.value = false;
};

const showServiceLogs = async () => {
  try {
    const res = await axios.get(`http://${backendUrl.value}/service-logs`);
    if (res.status === 200) {
      serviceLogs.value = res.data;
      logDrawerVisible.value = true;
    } else {
      ElMessage.error('获取服务日志失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('获取服务日志失败');
  }
};

const downloadLogs = async () => {
  try {
    const res = await axios.get(`http://${backendUrl.value}/download-logs`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `service-logs-${new Date().toISOString()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ElMessage.success('日志导出成功');
  } catch (error) {
    console.error(error);
    ElMessage.error('日志导出失败');
  }
};

const clearCache = async () => {
  clearingState.value = true;
  try {
    const res = await axios.post(`http://${backendUrl.value}/clear-cache`);
    if (res.status === 200) {
      ElMessage.success('缓存清除成功');
    } else {
      ElMessage.error('缓存清除失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('缓存清除失败');
  }
  clearingState.value = false;
};
</script>

<style scoped>
.board-container {
  padding: 24px;
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 100vh;
}

.mb-4 {
  margin-bottom: 24px;
}

.url-card,
.status-card,
.control-card,
.util-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
}

.url-card:hover,
.status-card:hover,
.control-card:hover,
.util-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn {
  border: none;
  background-color: transparent;
  color: var(--text-color);
  padding: 4px;
}

.status-descriptions {
  margin-top: 16px;
}

.core-version-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.upgrade-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
}

.control-btn {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.control-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.util-card .el-space {
  width: 100%;
  justify-content: center;
}

.log-drawer {
  background-color: var(--bg-color);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px;
}

.download-btn {
  margin-left: 16px;
}

.log-content {
  padding: 20px;
  background-color: var(--bg-color);
  color: var(--text-color);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

@media (max-width: 768px) {
  .board-container {
    padding: 16px;
  }

  .el-col {
    margin-bottom: 16px;
  }

  .control-btn {
    margin-bottom: 12px;
  }
}
</style>
