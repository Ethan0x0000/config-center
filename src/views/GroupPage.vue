<template>
  <div class="warper">
    <el-card class="group-card">
      <template #header>
        <div class="card-header">
          <el-text type="primary" size="large">出站分组</el-text>
        </div>
      </template>
      <el-scrollbar max-height="360px">
        <div style="margin:10px;">
          <VueDraggable v-model="outGroups" handle=".drag-handle" :animation="150" ghostClass="ghost">
            <div class="list-item" v-for="item in outGroups" :key="item.id">
              <div class="drag-handle">
                <Icon icon="mdi:drag-vertical-variant" height="24" width="24" />
              </div>
              <el-input v-model="item.name" placeholder="请输入分组名称" clearable @blur="updateOutGroup(item)"
                @keyup.enter="updateOutGroup(item)"></el-input>
              <el-button class="edit-btn" @click="handleEdit(item)" color="transparent" circle>
                <Icon icon="mingcute:edit-line" class="edit-icon" />
              </el-button>
              <el-button class="delete-btn" @click="handleOutGroupDelete(item)" color="transparent" circle>
                <Icon icon="material-symbols:delete-outline" class="delete-icon" />
              </el-button>
            </div>
          </VueDraggable>
        </div>
      </el-scrollbar>
      <el-button class="add-btn" type="primary" @click="handleOutGroupAdd">
        <Icon icon="mdi:plus" width="18" height="18" />
        <span>添加分组</span>
      </el-button>
    </el-card>

    <el-card class="group-card">
      <template #header>
        <div class="card-header">
          <el-text type="primary" size="large">规则分组</el-text>
        </div>
      </template>
      <el-scrollbar max-height="360px">
        <div style="margin:10px;">
          <VueDraggable v-model="ruleGroups" handle=".drag-handle" :animation="150" ghostClass="ghost">
            <div class="list-item" v-for="item in ruleGroups" :key="item.id">
              <div class="drag-handle">
                <Icon icon="mdi:drag-vertical-variant" height="28" width="auto" />
              </div>
              <el-input v-model="item.name" placeholder="请输入分组名称" clearable @blur="updateRuleGroup(item)"
                @keyup.enter="updateRuleGroup(item)"></el-input>
              <el-button class="delete-btn" @click="handleRuleGroupDelete(item)" color="transparent" circle>
                <Icon icon="material-symbols:delete-outline" class="delete-icon" />
              </el-button>
            </div>
          </VueDraggable>
        </div>
      </el-scrollbar>
      <el-button class="add-btn" type="primary" @click="handleRuleGroupAdd">
        <Icon icon="mdi:plus" width="18" height="18" />
        <span>添加分组</span>
      </el-button>
    </el-card>
  </div>
  <!-- 编辑分组对话框 -->
  <el-dialog v-model="dialogVisible" title="编辑出站分组" align-center>
    <div style="margin-bottom: 20px;">
      <div style="margin-bottom: 10px;">
        <el-text class="mx-1" type="primary">出站类型</el-text>
      </div>
      <el-radio-group v-model="currentItem.type" @change="showSaveButton = true">
        <el-radio :label="'url_test'">自动选择</el-radio>
        <el-radio :label="'selector'">手动选择</el-radio>
      </el-radio-group>
    </div>
    <div style="margin-bottom: 20px;">
      <div style="margin-bottom: 10px;">
        <el-text class="mx-1" type="primary">节点筛选</el-text>
      </div>
      <el-input v-model="nodeFilter" placeholder="输入正则表达式筛选节点" clearable>
        <template #append>
          <el-button @click="handleFilter">应用</el-button>
        </template>
      </el-input>
    </div>
    <div style="margin-bottom: 20px;">
      <div style="margin-bottom: 10px;">
        <el-text class="mx-1" type="primary">包含节点</el-text>
      </div>
      <div class="matched-nodes">
        <div v-for="node in currentItem.nodes" :key="node" style="display: flex; align-items: center;">
          <el-tag class="node-tag" type="info" effect="plain" closable
            @close="currentItem.nodes = currentItem.nodes.filter(n => n !== node); showSaveButton = true">{{ node }}</el-tag>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button v-if="showSaveButton" type="primary" @click="handleSave">保存</el-button>
      <el-button v-else type="primary" @click="handleSave" disabled>保存</el-button>
    </template>
  </el-dialog>
</template>


<script setup>
import { computed, defineProps, ref } from 'vue';
import { useStore } from 'vuex';
import { Icon } from '@iconify/vue';
import { VueDraggable } from 'vue-draggable-plus';
import { ElMessage } from 'element-plus';

const props = defineProps({
  out: {
    type: String,
    default: "outGroups"
  },
  rule: {
    type: String,
    default: "ruleGroups"
  }
});

const store = useStore();
// 获取当前配置
const currentProfileID = computed({
  get: () => store.state.profile.currentProfileID,
  set: (id) => store.commit('profile/setCurrentProfileID', id)
});

// 出站分组相关
const outGroups = computed({
  get: () => store.state.profile.profilesMap[currentProfileID.value][props.out],
  set: (val) => store.commit('profile/setProfileProperty', { profileID: currentProfileID.value, propertyName: props.out, value: val })
});

const updateOutGroup = (item) => {
  store.commit('profile/setProfileArrayItem', { profileID: currentProfileID.value, arrayName: props.out, payload: item });
};

const handleOutGroupAdd = () => {
  store.commit('profile/addProfileArrayItem', { profileID: currentProfileID.value, arrayName: props.out });
};

const handleOutGroupDelete = (item) => {
  store.commit('profile/deleteProfileArrayItem', { profileID: currentProfileID.value, arrayName: props.out, itemID: item.id });
};

// 编辑对话框相关
const dialogVisible = ref(false);
const currentItem = ref(null);
const nodeFilter = ref('');
const showSaveButton = ref(false);

const handleEdit = (item) => {
  currentItem.value = JSON.parse(JSON.stringify(item));
  nodeFilter.value = item.filter || '';
  currentItem.value.type = item.type || 'url_test';
  showSaveButton.value = false;
  dialogVisible.value = true;
};

const handleFilter = () => {
  try {
    const regex = new RegExp(nodeFilter.value);
    const nodeList = store.state.profile.nodeList || [];
    const nodeNames = nodeList.map(node => node.name);
    if (!nodeFilter.value) {
      showSaveButton.value = true;
      currentItem.value.nodes = nodeNames;
      return;
    }
    const matchedNodes = nodeNames.filter(name => regex.test(name));
    currentItem.value.nodes = matchedNodes;
    if (matchedNodes.length > 0) {
      ElMessage.success(`匹配到${matchedNodes.length}个节点`);
      showSaveButton.value = true;
    } else {
      showSaveButton.value = true;
      currentItem.value.nodes = [];
      ElMessage.warning('未匹配到任何节点');
    }
  } catch (e) {
    ElMessage.error('正则表达式无效：' + e.message);
  }
};

const handleSave = () => {
  if (currentItem.value) {
    const updatedItem = {
      ...currentItem.value,
      filter: nodeFilter.value
    };
    store.commit('profile/setProfileArrayItem', {
      profileID: currentProfileID.value,
      arrayName: props.out,
      payload: updatedItem
    });
    dialogVisible.value = false;
    showSaveButton.value = false;
    ElMessage.success('保存成功');
  }
};

// 规则分组相关
const ruleGroups = computed({
  get: () => store.state.profile.profilesMap[currentProfileID.value][props.rule],
  set: (val) => store.commit('profile/setProfileProperty', { profileID: currentProfileID.value, propertyName: props.rule, value: val })
});

const updateRuleGroup = (item) => {
  store.commit('profile/setProfileArrayItem', { profileID: currentProfileID.value, arrayName: props.rule, payload: item });
};

const handleRuleGroupAdd = () => {
  store.commit('profile/addProfileArrayItem', { profileID: currentProfileID.value, arrayName: props.rule });
};

const handleRuleGroupDelete = (item) => {
  store.commit('profile/deleteProfileArrayItem', { profileID: currentProfileID.value, arrayName: props.rule, itemID: item.id });
};
</script>

<style scoped>
.warper {
  display: flex;
  flex-wrap: wrap;
  margin: 20px;
  justify-content: space-between;
}

.group-card {
  min-width: 420px;
  width: 49%;
  margin-bottom: 20px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-color);
}

.card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.list-item {
  display: flex;
  align-items: center;
  padding: 5px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
}

.drag-handle {
  cursor: move;
  margin-right: 8px;
}

.delete-icon {
  width: 22px;
  height: 22px;
  color: #da8c8c;
}

.delete-btn:hover {
  background-color: transparent;
  border-color: transparent;
}

.delete-btn:hover .delete-icon {
  color: #ff0000;
}

.delete-btn:active {
  background-color: transparent;
  color: #fff;
}

.edit-icon {
  width: 20px;
  height: 20px;
  color: rgb(163, 199, 204);
}

.edit-btn:hover {
  background-color: transparent;
  border-color: transparent;
}

.edit-btn:hover .edit-icon {
  color: #73e3e7;
}

.add-btn {
  width: 100%;
  margin-top: 10px;
}

.matched-nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  border-radius: 4px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
}

.node-tag {
  transition: all 0.3s ease;
}

.node-tag:hover {
  transform: scale(1.05);
}

.warper {
  display: flex;
  flex-wrap: wrap;
  margin: 20px;
  justify-content: space-between;
}

.group-card {
  min-width: 420px;
  width: 49%;
  margin-bottom: 20px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-color);
}

.card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.list-item {
  display: flex;
  align-items: center;
  height: 36px;
  margin: 4px 0;
  padding: 5px 6px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.drag-handle {
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-right: 8px;
  min-width: 24px;
  height: 24px;
}

.drag-handle :deep(svg) {
  color: var(--text-color);
  opacity: 0.6;
  transition: all 0.3s;
}

.list-item:hover .drag-handle :deep(svg) {
  opacity: 0.9;
  transform: scale(1.05);
}

.delete-icon {
  width: 22px;
  height: 22px;
  color: #da8c8c;
}

.delete-btn:hover {
  background-color: transparent;
  border-color: transparent;
}

.delete-btn:hover .delete-icon {
  color: #ff0000;
}

.delete-btn:active {
  background-color: transparent;
  color: #fff;
}

.edit-icon {
  width: 20px;
  height: 20px;
  color: rgb(163, 199, 204);
}

.edit-btn:hover {
  background-color: transparent;
  border-color: transparent;
}

.edit-btn:hover .edit-icon {
  color: #73e3e7;
}

.add-btn {
  width: 100%;
  margin-top: 10px;
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