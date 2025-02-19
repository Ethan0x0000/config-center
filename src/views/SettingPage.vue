<template>
  <div class="global-setting">
    <el-card class="setting-card" shadow="hover">
      <template #header>
        <el-text type="primary" size="large" style="display: flex; justify-content: center;">全局</el-text>
      </template>
      <div class="info-box">
        <div class="git-token"
          style="display: flex;justify-content: center;align-items: center;width: 49%; margin:0px 0px 5px 0px;">
          <el-text style="width:80px;">GitToken:</el-text>
          <el-input class="input-box" v-model="gitToken" size="default" placeholder="请输入token" type="password" />
        </div>
        <el-button type="primary" @click="handleRecoverProfiles" :loading="recoverState"
          style="display: flex;justify-content: center;align-items: center;width: 49%;height: 32px; margin:0px 0px 5px 0px;">从Gist恢复配置</el-button>
        <div class="current-profile"
          style="display: flex;justify-content: center;align-items: center;width: 49%;margin:0px 0px 5px 0px;">
          <el-text style=" width:80px;">当前配置:</el-text>
          <el-select-v2 v-model="currentProfileID" :options="profileList" placeholder="请选择配置" />
        </div>
        <el-button type="primary" @click="handleBackupProfiles" :loading="backupState"
          style="display: flex;justify-content: center;align-items: center;width: 49%;height: 32px; margin:0px 0px 5px 0px;">备份配置至Gist</el-button>
      </div>
      <div class=" global-switch">
        <el-card class="switch-card" shadow="hover">
          <div class="switch-warper">
            <el-text>是否开启日志</el-text>
            <el-switch v-model="store.state.profile.global.isLog" inline-prompt active-text="Y" inactive-text="N" />
          </div>
        </el-card>
        <el-card class="switch-card" shadow="hover">
          <div class="switch-warper">
            <el-text>是否开启FakeIP</el-text>
            <el-switch v-model="store.state.profile.global.isFakeIP" inline-prompt active-text="Y" inactive-text="N" />
          </div>
        </el-card>
        <el-card class="switch-card" shadow="hover">
          <div class="switch-warper">
            <el-text>是否开启覆盖IP</el-text>
            <el-switch v-model="store.state.profile.global.isOverDst" inline-prompt active-text="Y" inactive-text="N" />
          </div>
        </el-card>
        <el-card class="switch-card" shadow="hover">
          <div class="switch-warper">
            <el-text>是否切换时打断</el-text>
            <el-switch v-model="store.state.profile.global.isTogShut" inline-prompt active-text="Y" inactive-text="N" />
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
  <VueDraggable v-model="profiles" :animation="150" handle=".drag-handle" ghostClass="ghost">
    <div class="profile-item" v-for="item in profiles" :key="item.id">
      <el-card class="profile-card" shadow="hover">
        <template #header>
          <div class="profile-header">
            <Icon class="drag-handle" icon="system-uicons:drag" width="32" height="32" />
            <div style="display: flex; justify-content: center; align-items: center; margin-left:76px;">
              <el-text :type="item.id === currentProfileID ? 'success' : ''" size="large"
                @click="handleSwitchProfile(item.id)" style="cursor: pointer;">{{ item.name }}</el-text>
              <el-button text @click="showEditDialog(item)" style="width: 32px;">
                <Icon icon="iconamoon:edit-duotone" width="18" height="18" />
              </el-button>
            </div>
            <div class="header-btn">
              <el-tooltip placement="top" content="复制" effect="light">
                <el-button class="copy-btn" text style="width: 32px;"
                  @click="store.dispatch('profile/copyProfile', item.id)">
                  <Icon class="copy-icon" icon="ph:copy-bold" width="24" height="24" />
                </el-button>
              </el-tooltip>
              <el-popconfirm title="确认删除该配置?" @confirm="store.dispatch('profile/deleteProfile', item.id)"
                :confirm-button-text="'确定'" :cancel-button-text="'取消'">
                <template #reference>
                  <el-button class="delete-btn" text style="width: 32px;">
                    <Icon class="delete-icon" icon="material-symbols:delete-outline" width="24" height="24" />
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </template>
        <el-card shadow="hover"
          style="margin-bottom:10px;  background-color: var(--bg-color);color: var(--text-color);">
          <div style="display: flex;flex-direction:row;justify-content: space-between;align-items: center;width: 100%;">
            <div
              style="display: flex;justify-content:center;min-width: 200px;max-width: 600px;width: 49%;margin-bottom: 5px;">
              <el-text>本地DNS：</el-text>
              <el-input v-model="item.dns.local" placeholder="请输入DNS地址" style="width: 150px;"
                @change="store.commit('profile/setProfileProperty', { id: item.id, propertyName: 'dns', value: item.dns })" />
            </div>
            <div
              style="display: flex;justify-content:center;min-width: 200px;max-width: 600px;width: 49%;margin-bottom: 5px;">
              <el-text>远程DNS：</el-text>
              <el-input v-model="item.dns.remote" placeholder="请输入DNS地址" style="width: 150px;"
                @change="store.commit('profile/setProfileProperty', { id: item.id, propertyName: 'dns', value: item.dns })" />
            </div>
            <div
              style="display: flex;justify-content:center;min-width: 200px;max-width: 600px;width: 49%;margin-bottom: 5px;">
              <el-text>解析DNS：</el-text>
              <el-input v-model="item.dns.resolver" placeholder="请输入DNS地址" style="width: 150px;"
                @change="store.commit('profile/setProfileProperty', { id: item.id, propertyName: 'dns', value: item.dns })" />
            </div>
          </div>
        </el-card>
        <div class="profile-option">
          <el-card
            style="min-width: 200px;max-width: 600px;width: 49%;margin-bottom: 5px; background-color: var(--bg-color);color: var(--text-color);"
            shadow="hover">
            <div class="switch-warper">
              <el-text>是否使用全局配置</el-text>
              <el-switch v-model="item.isUseGlobal" inline-prompt active-text="Y" inactive-text="N"
                @change="store.commit('profile/setProfileProperty', { id: item.id, propertyName: 'isUseGlobal', value: item.isUseGlobal })" />
            </div>
          </el-card>
          <el-card
            style="min-width: 200px;max-width: 600px;width: 49%;margin-bottom: 5px; background-color: var(--bg-color);color: var(--text-color);"
            shadow="hover">
            <div style="display: flex;justify-content: center;">
              <el-text>目标平台：</el-text>
              <el-select-v2 v-model="item.target" :options="options" placeholder="暂未选择" style="width:150px;"
                @change="store.commit('profile/setProfileProperty', { id: item.id, propertyName: 'target', value: item.target })">
              </el-select-v2>
            </div>
          </el-card>
        </div>
        <div class="profile-switch" v-if="!item.isUseGlobal">
          <el-card class="switch-card" shadow="hover">
            <div class="switch-warper">
              <el-text>是否开启日志</el-text>
              <el-switch v-model="item.isLog" inline-prompt active-text="Y" inactive-text="N"
                @change="store.commit('profile/setProfileProperty', { id: item.id, propertyName: 'isLog', value: item.isLog })" />
            </div>
          </el-card>
          <el-card class="switch-card" shadow="hover">
            <div class="switch-warper">
              <el-text>是否开启FakeIP</el-text>
              <el-switch v-model="item.isFakeIP" inline-prompt active-text="Y" inactive-text="N"
                @change="store.commit('profile/setProfileProperty', { id: item.id, propertyName: 'isFakeIP', value: item.isFakeIP })" />
            </div>
          </el-card>
          <el-card class="switch-card" shadow="hover">
            <div class="switch-warper">
              <el-text>是否开启覆盖IP</el-text>
              <el-switch v-model="item.isOverDst" inline-prompt active-text="Y" inactive-text="N"
                @change="store.commit('profile/setProfileProperty', { id: item.id, propertyName: 'isOverDst', value: item.isOverDst })" />
            </div>
          </el-card>
          <el-card class="switch-card" shadow="hover">
            <div class="switch-warper">
              <el-text>是否切换时打断</el-text>
              <el-switch v-model="item.isTogShut" inline-prompt active-text="Y" inactive-text="N"
                @change="store.commit('profile/setProfileProperty', { id: item.id, propertyName: 'isTogShut', value: item.isTogShut })" />
            </div>
          </el-card>
        </div>
        <div class="profile-action">
          <el-button
            style="display: flex;justify-content: center;align-items: center;width: 49%;height: 40px; margin:0px 0px 5px 0px;"
            type="primary" @click="generateConfig(item.id, item.nodeIDs)" :loading="generateState[item.id]">
            <span>生成配置</span>
          </el-button>
          <el-button
            style="display: flex;justify-content: center;align-items: center;width: 49%;height: 40px; margin:0px 0px 5px 0px;"
            type="primary" @click="showCode(item.value)">
            <span>编辑配置</span>
          </el-button>
          <el-button :disabled="store.state.user.gitToken === ''"
            style="display: flex;justify-content: center;align-items: center;width: 49%;height: 40px; margin:0px 0px 5px 0px;"
            type="primary" @click="handleUpload(item)" :loading="uploadState[item.id]">
            <span>上传配置</span>
          </el-button>
          <el-button v-if="item.target === 'linux'"
            :disabled="!(store.state.user.backendUrl !== '' && item.value !== '')"
            style="display: flex;justify-content: center;align-items: center;width: 49%;height: 40px; margin:0px 0px 5px 0px;"
            type="primary" @click="handleUpdate(item)" :loading="updateState[item.id]">
            <span>更新配置</span>
          </el-button>
        </div>
      </el-card>
    </div>
  </VueDraggable>
  <el-button class=" add-btn" type="primary" @click="store.dispatch('profile/addProfile')">
    <Icon icon="mdi:plus" width="18" height="18" />
    <span>添加配置</span>
  </el-button>

  <el-dialog v-model="showCodeDialog" title="配置代码" width="60%" align-center>
    <CodeDisplay :key="showCodeDialog" :content="code" :language="'json'" @change="handleCodeChange" />
    <template #footer>
      <div class="code-dialog-footer">
        <el-button v-if="showCodeCommit" type="primary" @click="handleCodeCommit">
          提交修改
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="editingStates[editProfile.id]" title="编辑名称" style="width: 300px;" align-center>
    <el-input v-model="editProfile.name" placeholder="请输入配置名称" style="width: 100%;"></el-input>
    <template #footer>
      <el-button type="primary" @click="handleSaveName(editProfile)">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import CodeDisplay from '@/components/CodeDisplay.vue'

import { computed, reactive, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { VueDraggable } from 'vue-draggable-plus'
import { Icon } from '@iconify/vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

onMounted(() => {
  store.dispatch('profile/initProfile');
});

const backendUrl = computed(() => store.state.user.backendUrl);

const options = [
  { value: 'pc', label: 'PC端' },
  { value: 'mobile', label: '移动端' },
  { value: 'linux', label: 'Linux端' },
]

const store = useStore();
const editProfile = ref({});
const gitToken = computed({
  get: () => store.state.user.gitToken,
  set: (value) => store.commit('user/setGitToken', value)
});
const profiles = computed({
  get: () => store.state.profile.profiles,
  set: (value) => store.commit('profile/setProfiles', value)
});
const profileList = computed(() => {
  return profiles.value.map(profile => ({ value: profile.id, label: profile.name }));
}, [profiles]);
const currentProfileID = computed({
  get: () => store.state.profile.currentProfileID,
  set: (id) => store.commit('profile/setCurrentProfileID', id)
});

const recoverState = ref(false);
const handleRecoverProfiles = async () => {
  recoverState.value = true;
  const name = 'ConfigCenter-backup.json';
  const token = store.state.user.gitToken;

  try {
    // 获取所有的 Gists
    const response = await axios.get('https://api.github.com/gists', {
      headers: {
        'Authorization': `token ${token}`
      }
    });

    // 找到包含指定文件名的 Gist
    const existingGist = response.data.find(gist => {
      const files = Object.values(gist.files);
      return files.some(file => file.filename === name);
    });

    if (existingGist) {
      // 获取指定文件的内容
      const fileUrl = existingGist.files[name].raw_url;
      const profile = await axios.get(fileUrl);

      store.dispatch('profile/setProfile', profile.data);
      ElMessage.success('配置已成功恢复');
    } else {
      ElMessage.warning('未找到对应的备份配置');
    }
  } catch (error) {
    console.error(error); // 打印错误信息以便调试
    ElMessage.error('恢复配置失败: ' + error.message); // 显示详细的错误信息
  }

  recoverState.value = false;
};

const backupState = ref(false);
const handleBackupProfiles = async () => {
  backupState.value = true;
  const name = 'ConfigCenter-backup.json';
  const data = {
    description: 'ConfigCenter备份配置',
    public: true,
    files: {
      [name]: {
        content: JSON.stringify(store.state.profile, null, 2)
      }
    }
  };

  const token = store.state.user.gitToken;

  try {
    // 先尝试获取现有的 Gist
    const response = await axios.get('https://api.github.com/gists', {
      headers: {
        'Authorization': `token ${token}`
      }
    });
    const existingGist = response.data.find(gist => {
      const files = Object.values(gist.files);
      return files.some(file => file.filename === name);
    });

    if (existingGist) {
      // 如果存在对应的 Gist,则更新
      const gistId = existingGist.id;
      const updateResponse = await axios({
        method: 'patch',
        url: `https://api.github.com/gists/${gistId}`,
        headers: {
          'Authorization': `token ${token}`
        },
        data: data
      });

      const updatedGistUrl = updateResponse.data.html_url;
      const fileUrl = `${updatedGistUrl}/raw/${name}`;
      console.log('配置链接', fileUrl)
      ElMessage.success('备份配置已更新');
    } else {
      // 如果不存在对应的 Gist,则创建新的
      const createResponse = await axios({
        method: 'post',
        url: 'https://api.github.com/gists',
        headers: {
          'Authorization': `token ${token}`
        },
        data: data
      });

      const gistUrl = createResponse.data.html_url;
      const fileUrl = `${gistUrl}/raw/${name}`;
      console.log('配置链接', fileUrl)
      ElMessage.success('备份配置已创建');
    }
  } catch (error) {
    console.error(error); // 打印错误信息以便调试
    ElMessage.error('操作失败: ' + error.message); // 显示详细的错误信息
  }
  backupState.value = false;
};

const generateState = reactive({});
const generateConfig = async (id, nodeIDs) => {
  generateState[id] = true;
  try {
    // 检测 profile.nodes 数组是否为空或者数组元素中的 url 属性是否全为空
    const hasValidSubs = store.state.profile.subs.some(sub => sub.usedNodes.length > 0 && sub.isGroup);
    if (nodeIDs.length === 0 && !hasValidSubs) {
      ElMessage.warning('节点列表和订阅节点均为空，无法生成配置');
      throw new Error('终止生成配置');
    }
    await store.dispatch('profile/generateConfig', id);
  } catch (err) {
    ElMessage.error('生成配置失败');
    console.error(err);
  }
  generateState[id] = false;
};

const uploadState = reactive({});
const handleUpload = async (item) => {
  uploadState[item.id] = true;
  const name = 'singbox-config-' + item.name + '.json';
  const data = {
    description: 'SingBox在' + item.target + '端的配置',
    public: true,
    files: {
      [name]: {
        content: item.value
      }
    }
  };

  const token = store.state.user.gitToken;

  try {
    // 先尝试获取现有的 Gist
    const response = await axios.get('https://api.github.com/gists', {
      headers: {
        'Authorization': `token ${token}`
      }
    });
    const existingGist = response.data.find(gist => {
      const files = Object.values(gist.files);
      return files.some(file => file.filename === name);
    });

    if (existingGist) {
      // 如果存在对应的 Gist,则更新
      const gistId = existingGist.id;
      const updateResponse = await axios({
        method: 'patch',
        url: `https://api.github.com/gists/${gistId}`,
        headers: {
          'Authorization': `token ${token}`
        },
        data: data
      });

      const updatedGistUrl = updateResponse.data.html_url;
      const fileUrl = `${updatedGistUrl}/raw/${name}`;
      ElMessage.success('配置更新成功');
      copyToClipboard(fileUrl);
      ElMessage('配置链接已复制到剪贴板');
    } else {
      // 如果不存在对应的 Gist,则创建新的
      const createResponse = await axios({
        method: 'post',
        url: 'https://api.github.com/gists',
        headers: {
          'Authorization': `token ${token}`
        },
        data: data
      });

      const gistUrl = createResponse.data.html_url;
      const fileUrl = `${gistUrl}/raw/${name}`;
      ElMessage.success('配置创建成功');
      copyToClipboard(fileUrl);
      ElMessage('配置链接已复制到剪贴板');
    }
  } catch (error) {
    console.error(error); // 打印错误信息以便调试
    ElMessage.error('操作失败: ' + error.message); // 显示详细的错误信息
  }
  uploadState[item.id] = false;
};

const updateState = reactive({});
const handleUpdate = async (item) => {
  updateState[item.id] = true;
  try {
    const res = await axios.post(`http://${backendUrl.value}/update-config`, { config: item.value }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (res.status === 200) {
      ElMessage.success('更新配置成功');
      console.log(res.data);
    } else {
      ElMessage.error('更新配置失败');
    }
  } catch (err) {
    console.error(err);
    ElMessage.error('更新配置失败');
  }
  updateState[item.id] = false;
};


const copyToClipboard = (text) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
};

const showCodeDialog = ref(false);
const showCodeCommit = ref(false);
const code = ref('');
const showCode = (value) => {
  code.value = value;
  showCodeDialog.value = true;
};

const handleCodeChange = (value) => {
  code.value = value;
  showCodeCommit.value = true;
};

const handleCodeCommit = () => {
  store.commit('profile/setProfileProperty', { profileID: currentProfileID.value, propertyName: 'value', value: code.value });
  ElMessage({
    message: '配置已修改',
    type: 'success',
  })
};

const handleSwitchProfile = (id) => {
  store.commit('profile/setCurrentProfileID', id);
};

const editingStates = reactive({});
const showEditDialog = (item) => {
  editProfile.value = item;
  editingStates[item.id] = true;
};

const handleSaveName = (item) => {
  editingStates[item.id] = false;
  store.commit('profile/setProfileProperty', { id: item.id, propertyName: 'name', value: item.name })
};
</script>

<style scoped>
.global-setting {
  width: 100%;
  height: auto;
  margin-bottom: 20px;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.info-box {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
}

.global-switch {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.setting-card {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.profile-card {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.switch-card {
  min-width: 200px;
  max-width: 250px;
  width: 49%;
  margin-bottom: 5px;
  box-shadow: 0 2px 8px var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-color);
}

.switch-warper {
  display: flex;
  justify-content: space-between;
}

.profile-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.profile-item {
  width: 100%;
  margin-bottom: 5px;
}

.profile-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.drag-handle {
  cursor: move;
}

.copy-icon {
  width: 24px;
  height: 24px;
  color: var(--text-color);
}

.copy-btn:hover .copy-icon {
  color: var(--primary-color);
}

.delete-icon {
  width: 24px;
  height: 24px;
  color: var(--danger-light);
}

.delete-btn:hover .delete-icon {
  color: var(--danger);
}

.profile-option {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 15px;
}

.profile-switch {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 15px;
}

.profile-action {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
}

.add-btn {
  width: 100%;
  height: 40px;
}

.ghost {
  opacity: 0.5;
  background: var(--primary-light);
}
</style>
