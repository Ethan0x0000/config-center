<template>
  <el-card shadow="hover" style="background-color: var(--bg-color); border-radius: 8px;">
    <template #header>
      <div class="card-header">
        <el-text type="primary" size="large"
          style="display: flex; justify-content: center;margin-left:32px; color: var(--text-color);">节点列表</el-text>
        <div style="display: flex; gap: 10px;">
          <el-button class="add-btn" @click="handleAddNode" text style="width: 32px;">
            <Icon icon="mdi:plus" width="18" height="18" />
          </el-button>
        </div>
      </div>
    </template>
    <VueDraggable v-model="nodes" handle=".drag-handle" :animation="150" direction="horizontal" ghostClass="ghost"
      style="display: flex; flex-wrap: wrap;">
      <el-card v-for="item in nodes" :key="item.id" class="card-item" shadow="never" body-style="padding: 5px;"
        style="background-color: var(--bg-color);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <Icon class="drag-handle" icon="mdi:drag-vertical-variant" width="24" height="24" />
          <el-button @click="handleEditNode(item)" text style="width: 32px;" circle>
            <Icon icon="iconamoon:edit-duotone" width="18" height="18" />
          </el-button>
          <el-text :type="isNodeSelected(item.id) ? 'success' : ''" @click="toggleUse(item.id)"
            style="cursor: pointer; padding: 4px 8px; border-radius: 4px;"
            :style="{ backgroundColor: isNodeSelected(item.id) ? 'transparent' : 'transparent' }">{{ item.name }}</el-text>
          <el-button class="delete-btn" @click="handleDeleteNode(item)" style="width: 32px;" color="transparent" text
            circle>
            <Icon icon="typcn:delete" width="24" height="24" class="delete-icon" />
          </el-button>
        </div>
      </el-card>
    </VueDraggable>
  </el-card>
  <el-dialog :title="dialogState === DialogState.ADD ? '添加节点' : '编辑节点'" v-model="dialogVisible" width="30%" align-center
    :before-close="handleDialogClose" style="background-color: var(--bg-color);">
    <div style="display: flex; flex-direction: row;align-content: center;">
      <el-text style="width:50px; color: var(--text-color);">名称：</el-text>
      <el-input class="node-name" v-model="editItem.name"></el-input>
    </div>
    <div v-if="editItem.hasOwnProperty('link')"
      style="display: flex; flex-direction: row;align-content: center;margin-top:10px;">
      <el-text style="width:50px; color: var(--text-color);">链接：</el-text>
      <el-input class="node-link" v-model="editItem.link"></el-input>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleSave" :loading="isLoading">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { VueDraggable } from 'vue-draggable-plus';
import { Icon } from '@iconify/vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const store = useStore();
const currentProfileID = computed(() => store.state.profile.currentProfileID);

const DialogState = {
  CLOSED: 0,
  ADD: 1,
  EDIT: 2
};

const dialogState = ref(DialogState.CLOSED);
const dialogVisible = computed(() => dialogState.value !== DialogState.CLOSED);

const nodes = computed({
  get: () => store.state.profile.nodeList,
  set: (val) => store.commit('profile/setNodeList', val)
});

const editItem = ref({});


const handleAddNode = () => {
  dialogState.value = DialogState.ADD;
  editItem.value = {
    id: crypto.randomUUID(),
    name: '',
    link: ''
  };
};

const handleEditNode = (item) => {
  dialogState.value = DialogState.EDIT;
  editItem.value = { ...item };
};

const handleDialogClose = () => {
  dialogState.value = DialogState.CLOSED;
  editItem.value = {};
};

const isNodeSelected = computed(() => (id) => {
  const currentIDs = store.state.profile.profilesMap[currentProfileID.value]?.nodeIDs || [];
  return currentIDs.includes(id);
});

const toggleUse = (id) => {
  if (isNodeSelected.value(id)) {
    store.commit('profile/deleteNodeID', { profileID: currentProfileID.value, nodeID: id });
  } else {
    store.commit('profile/addNodeID', { profileID: currentProfileID.value, nodeID: id });
  }
};

const timeout = (ms, promise) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]);
};

const isLoading = ref(false);
const handleSave = async () => {
  isLoading.value = true;
  try {
    if (editItem.value.link) {
      const url = 'https://url.v1.mk/sub?target=singbox&url=' + encodeURIComponent(editItem.value.link) + '&insert=false&emoji=true&list=true&xudp=true&udp=true&tfo=false&expand=false&scv=true&fdn=false&singbox.ipv6=1';
      const response = await timeout(10000, axios.get(url));
      editItem.value.content = response.data.outbounds[0];
    }

    if (dialogState.value === DialogState.ADD) {
      store.commit('profile/addNodeList', editItem.value);
      store.commit('profile/addNodeID', {
        profileID: currentProfileID.value,
        nodeID: editItem.value.id
      });
    } else {
      store.commit('profile/setNode', editItem.value);
    }

    ElMessage.success(dialogState.value === DialogState.ADD ? '添加成功' : '保存成功');
    dialogState.value = DialogState.CLOSED;
  } catch (error) {
    if (error.message === 'Operation timed out') {
      ElMessage.error('请求超时');
    } else {
      console.error('保存失败:', error);
      ElMessage.error('保存失败');
    }
  } finally {
    isLoading.value = false;
  }
};

const handleDeleteNode = (item) => {
  store.commit('profile/deleteNodeList', item.id);
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.card-item {
  width: auto;
  margin: 10px;
  border-radius: 20px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
}

.drag-handle {
  cursor: move;
  display: flex;
  align-items: center;
  overflow: hidden;
  min-width: 24px;
  margin-right: 4px;
}

.delete-icon {
  color: #FB513E;
}

.delete-icon:hover {
  color: red;
}


.ghost {
  opacity: 0.5;
  background: var(--primary-light);
}

.el-card__body {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.el-card {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
}

.el-dialog {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.el-dialog__header {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.el-dialog__body {
  background-color: var(--bg-color);
  color: var(--text-color);
}

/* 新增表单元素暗色模式适配 */
:deep(.el-input) {
  --el-input-bg-color: var(--bg-color) !important;
  --el-input-text-color: var(--text-color) !important;
  --el-input-border-color: var(--border-color) !important;
}

:deep(.el-input__wrapper) {
  --el-input-bg-color: var(--bg-color) !important;
  --el-input-text-color: var(--text-color) !important;
  --el-input-border-color: var(--border-color) !important;
}
</style>
