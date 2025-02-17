<template>
  <el-card shadow="hover" style="background-color: var(--bg-color);">
    <template #header>
      <div class="card-header">
        <el-text type="primary" size="large"
          style="display: flex; justify-content: center;margin-left:32px; color: var(--text-color);">节点列表</el-text>
        <el-button class="add-btn" @click="handleAddNode" text style="width: 32px;">
          <Icon icon="mdi:plus" width="18" height="18" />
        </el-button>
      </div>
    </template>
    <VueDraggable v-model="nodes" handle=".drag-handle" :animation="150" direction="horizontal" ghostClass="ghost"
      style="display: flex; flex-wrap: wrap;">
      <el-card v-for="item in nodes" :key="item.id" class="card-item" shadow="never" body-style="padding: 5px;"
        style="background-color: var(--bg-color);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <Icon class="drag-handle" icon="ic:baseline-drag-indicator" width="21" height="21" />
          <el-button @click="handleEditNode(item)" text style="width: 32px;" circle>
            <Icon icon="iconamoon:edit-duotone" width="18" height="18" />
          </el-button>
          <el-text :type="isNodeSelected(item.id) ? 'success' : ''" @click="toggleUse(item.id)"
            style="cursor: pointer; color: var(--text-color);">{{ item.name }}</el-text>
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
      <el-button @click="handleDialogClose">取消</el-button>
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
  store.commit('profile/addNodeList');
  store.commit('profile/addNodeID', {
    profileID: currentProfileID.value,
    nodeID: store.state.profile.nodeList[store.state.profile.nodeList.length - 1].id
  });
  editItem.value = { ...store.state.profile.nodeList[store.state.profile.nodeList.length - 1] };
};

const handleEditNode = (item) => {
  dialogState.value = DialogState.EDIT;
  editItem.value = { ...item };
};

const handleDialogClose = () => {
  if (dialogState.value === DialogState.ADD) {
    store.commit('profile/deleteNodeList', editItem.value.id);
  }
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
  if (editItem.value.link) {
    try {
      const url = 'https://url.v1.mk/sub?target=singbox&url=' + encodeURIComponent(editItem.value.link) + '&insert=false&emoji=true&list=true&xudp=true&udp=true&tfo=false&expand=false&scv=true&fdn=false&singbox.ipv6=1';
      const response = await timeout(10000, axios.get(url));
      editItem.value.content = response.data.outbounds[0];
      store.commit('profile/setNode', editItem.value);
    } catch (error) {
      if (error.message === 'Operation timed out') {
        ElMessage.error('请求超时');
      } else {
        console.log(error);
      }
    }
  } else {
    store.commit('profile/setNode', editItem.value);
  }
  isLoading.value = false;
  dialogState.value = DialogState.CLOSED;
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
}

.delete-btn:hover {
  background-color: transparent;
}

.delete-btn:active {
  background-color: transparent;
}

.delete-icon {
  color: var(--danger-light);
}

.delete-btn:hover .delete-icon {
  color: var(--danger);
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

.el-dialog__footer {
  background-color: var(--bg-color);
  color: var(--text-color);
}
</style>
