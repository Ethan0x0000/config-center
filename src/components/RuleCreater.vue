<template>
  <el-scrollbar max-height="360px">
    <div style="margin:10px;">
      <VueDraggable v-model="items" handle=".drag-handle" :animation="150" ghostClass="ghost">
        <div class="list-item" v-for="item in items" :key="item.id">
          <!-- 这里的handle是用来拖动的 -->
          <div class="drag-handle">
            <Icon icon="mdi:drag-vertical-variant" height="28" width="auto" />
          </div>
          <!-- 这里的type是用来选择规则类型的 -->
          <el-select-v2 v-model="item.type" :options="options" placeholder="选择类型" style="width:200px"
            @change="store.commit('profile/setProfileArrayItem', { id: item.id, arrayName: 'udRules', value: item });" />
          <!-- 这里的name是用来输入规则集名称的 -->
          <el-input v-model="item.name" placeholder="请输入规则集名称" clearable
            @blur="store.commit('profile/setProfileArrayItem', { id: item.id, arrayName: 'udRules', value: item });"
            @keyup.enter="store.commit('profile/setProfileArrayItem', { id: item.id, arrayName: 'udRules', value: item });"></el-input>
          <!-- 这里的按钮用来编辑规则集的 -->
          <el-button class="edit-btn" @click="handleEdit(item)" color="transparent" circle>
            <Icon icon="mingcute:edit-line" class="edit-icon" />
          </el-button>
          <!-- 这里的按钮用来删除规则集 -->
          <el-button class="delete-btn" @click="handleDelete(item)" color="transparent" circle>
            <Icon icon="material-symbols:delete-outline" class="delete-icon" />
          </el-button>
        </div>
      </VueDraggable>
    </div>
  </el-scrollbar>
  <!-- 这里的按钮用来添加规则集 -->
  <el-button class="add-btn" type="primary" @click="handleAdd">
    <Icon icon="mdi:plus" width="18" height="18" />
    <span>添加规则</span>
  </el-button>

  <!-- 弹出对话框用来编辑规则 -->
  <el-dialog v-model="dialogVisible" title="编辑自定义规则" align-center>
    <div class="property-container" style="display: flex; flex-direction: row; gap:10px;">
      <el-checkbox v-model="editItem.isUse" label="启用规则" size="large" @change="showSaveButton = true" />
      <el-checkbox v-model="editItem.isPriority" label="优先匹配" size="large" @change="showSaveButton = true" />
      <el-checkbox v-model="editItem.isGroup" label="建立分组" size="large" @change="showSaveButton = true" />
    </div>
    <CodeDisplay :content="editItem.content" :key="dialogVisible" @change="handleCodeChange" />
    <template #footer>
      <el-button v-if="showSaveButton" type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import CodeDisplay from '@/components/CodeDisplay.vue'
import { ElMessage } from 'element-plus';

import { useStore } from 'vuex';
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { VueDraggable } from 'vue-draggable-plus';

const store = useStore();
const dialogVisible = ref(false);
const editItem = ref(null);
const demoCode = `{
  "query_type": ["A", "HTTPS", 32768],
  "network": ["tcp"],
  "domain": ["test.com"],
  "domain_suffix": [".cn"],
  "domain_keyword": ["test"],
  "domain_regex": ["^stun\\\\..+"],
  "source_ip_cidr": ["10.0.0.0/24", "192.168.0.1"],
  "ip_cidr": ["10.0.0.0/24", "192.168.0.1"],
  "source_port": [12345],
  "source_port_range": ["1000:2000", ":3000", "4000:"],
  "port": [80, 443],
  "port_range": ["1000:2000", ":3000", "4000:"],
  "process_name": ["curl"],
  "process_path": ["/usr/bin/curl"],
  "package_name": ["com.termux"],
  "wifi_ssid": ["My WIFI"],
  "wifi_bssid": ["00:00:00:00:00:00"],
  "invert": false
}
`;
const showSaveButton = ref(false);
const options = [
  { value: 'proxy', label: '代理' },
  { value: 'direct', label: '直连' },
  { value: 'block', label: '拦截' },
]

const currentProfileID = computed({
  get: () => store.state.profile.currentProfileID,
  set: (id) => store.commit('profile/setCurrentProfileID', id)
});
const items = computed({
  get: () => store.state.profile.profilesMap[currentProfileID.value].udRules,
  set: (val) => store.commit('profile/setProfileProperty', { profileID: currentProfileID.value, propertyName: 'udRules', value: val })
});

const handleDelete = (item) => {
  store.commit('profile/deleteProfileArrayItem', { profileID: currentProfileID.value, arrayName: 'udRules', itemID: item.id });
};
const handleAdd = () => {
  store.commit('profile/addProfileArrayItem', { profileID: currentProfileID.value, arrayName: 'udRules' });
};

const handleEdit = (item) => {
  editItem.value = item;
  if (item.content !== '' && item.content !== demoCode) {
    editItem.value.content = item.content;
  } else {
    editItem.value.content = demoCode;
  }
  dialogVisible.value = true;
};

const handleCodeChange = (value) => {
  editItem.value.content = value;
  showSaveButton.value = true;
};

const handleSave = () => {
  if (editItem.value.content === demoCode) {
    editItem.value.content = '';
  }
  store.commit('profile/setProfileArrayItem', { id: editItem.value.id, arrayName: 'udRules', value: editItem.value });
  ElMessage.success('保存成功');
}
</script>

<style scoped>
.list-item {
  display: flex;
  align-items: center;
  height: 30px;
  margin: 4px 0;
  padding: 4px 4px;
  background-color: #d8eaff;
  border-radius: 6px;
}

.drag-handle {
  cursor: move;
  display: flex;
  align-items: center;
  overflow: hidden;
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

.add-btn {
  margin: 10px;
  width: calc(100% - 20px)
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>