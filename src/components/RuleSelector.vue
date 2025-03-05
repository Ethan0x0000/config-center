<template>
  <el-scrollbar max-height="360px">
    <div style="margin:10px;">
      <VueDraggable v-model="items" handle=".drag-handle" :animation="150" ghostClass="ghost">
        <div class="list-item" v-for="item in items" :key="item.id">
          <!-- 这里的handle是用来拖动的 -->
          <div class="drag-handle">
            <Icon icon="mdi:drag-vertical-variant" height="24" width="24" />
          </div>
          <!-- 这里的name是用来输入规则集的 -->
          <el-autocomplete v-model="item.name" :fetch-suggestions="querySearch" clearable class="inline-input w-50"
            :debounce="300" placeholder="请输入规则集" @blur="handleBlur(item)">
            <template #default="{ item }">
              <div style="display: flex; justify-content: space-between;">
                <el-text type="primary">{{ item.value }}</el-text>
                <el-text>{{ item.repo }}</el-text>
              </div>
            </template>
          </el-autocomplete>
          <!-- 这里的按钮用来查看规则集详情 -->
          <el-button class="edit-btn" @click="handleView(item)" color="transparent" circle>
            <Icon icon="mingcute:edit-line" class="view-icon" />
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
  <!-- 弹出对话框用来展示代码 -->
  <el-dialog class="code-dialog" v-model="dialogVisible" title="规则集详情" align-center>
    <div style="margin-bottom: 20px;">
      <div style="margin-bottom: 8px; font-weight: 500;">分组名</div>
      <el-select v-model="currentRuleName" clearable @change="updateRuleName" @clear="currentRuleName = '自动生成'">
        <el-option v-for="group in ruleGroups" :key="group" :label="group" :value="group" />
      </el-select>
      <div style="margin-top: 10px; color: #666;">
        规则链接: {{ currentRuleItem?.url }}
        <el-button style="margin-left: 10px;" type="primary" @click="loadRuleCode" :loading="loading">加载规则代码</el-button>
      </div>
    </div>
    <CodeDisplay v-if="showCode" :key="dialogVisible" :content="jsonData" :readOnly="readOnly"
      :editorTheme="store.state.theme.currentTheme == 'dark' ? 'vs-dark' : 'vs'" />
  </el-dialog>
</template>

<script setup>
import CodeDisplay from '@/components/CodeDisplay.vue'

import { useStore } from 'vuex';
import { ref, defineProps, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { VueDraggable } from 'vue-draggable-plus';
import { ElMessage } from 'element-plus';

const store = useStore();
const dialogVisible = ref(false);
const jsonData = ref('');
const readOnly = true;
const loading = ref(null); // 用于控制加载动画
const currentRuleName = ref('自动生成'); // 当前查看的规则名称
const currentRuleItem = ref(null); // 当前查看的规则项，包含url等完整信息
const showCode = ref(false); // 控制是否显示代码框


const props = defineProps({
  module: {
    type: String,
    default: "proxyRules",
    required: true
  },
  rule: {
    type: String,
    default: "ruleGroups"
  }
});

const currentProfileID = computed({
  get: () => store.state.profile.currentProfileID,
  set: (id) => store.commit('profile/setCurrentProfileID', id)
});
// 从store获取规则组列表
const ruleGroups = computed(() => {
  // 检查profilesMap是否存在以及是否有当前配置文件ID对应的数据
  const profileData = store.state.profile.profilesMap[currentProfileID.value];
  if (!profileData || !profileData[props.rule]) {
    return ['自动生成'];
  }
  const groups = profileData[props.rule].map((group) => group?.name || '').filter(Boolean);
  return ['自动生成', ...groups];
});
const items = computed({
  get: () => store.state.profile.profilesMap[currentProfileID.value][props.module],
  set: (val) => store.commit('profile/setProfileProperty', { profileID: currentProfileID.value, propertyName: props.module, value: val })
});

const querySearch = (queryString, cb) => {
  // 未输入时不提供建议
  if (!queryString) {
    return cb([])
  }
  const regex = new RegExp(queryString, 'i')
  const results = store.state.rule_sets.ruleSets.filter((item) =>
    regex.test(item.value)
  )
  cb(results)
};

const handleDelete = (item) => {
  store.commit('profile/deleteProfileArrayItem', { profileID: currentProfileID.value, arrayName: props.module, itemID: item.id });
};

const handleAdd = () => {
  store.commit('profile/addProfileArrayItem', { profileID: currentProfileID.value, arrayName: props.module });
};

const handleBlur = (item) => {
  // 检查输入框的值是否存在于建议列表中
  const matchedItem = store.state.rule_sets.ruleSets.find(
    (option) => option.value === item.name
  );
  // 如果存在，则将url赋值给item.url
  if (matchedItem) {
    item.url = matchedItem.url;
    console.log('存在,赋值url:', matchedItem.url);
  } else {
    // 如果不存在,则清空输入框
    item.name = '';
    console.log('不存在,清空输入框');
  }
  store.commit('profile/setProfileArrayItem', { profileID: currentProfileID.value, arrayName: props.module, payload: item })
};

const handleView = async (item) => {
  if (item.url) {
    currentRuleItem.value = item;
    // 如果item没有groupName或groupName为空，则使用'自动生成'作为默认值
    currentRuleName.value = item.groupName || '自动生成';
    dialogVisible.value = true;
    // 重置状态
    showCode.value = false;
    jsonData.value = '';
  }
};

const updateRuleName = () => {
  if (currentRuleItem.value) {
    // 只更新groupName
    currentRuleItem.value.groupName = currentRuleName.value;
    store.commit('profile/setProfileArrayItem', {
      profileID: currentProfileID.value,
      arrayName: props.module,
      payload: currentRuleItem.value
    });
  }
};

const loadRuleCode = async () => {
  if (!currentRuleItem.value?.url) return;

  try {
    loading.value = true;
    const modifiedUrl = currentRuleItem.value.url.replace(/\.srs$/, '.json');
    const response = await fetch(modifiedUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    jsonData.value = await response.text();
    showCode.value = true; // 加载成功后显示代码框
  } catch (error) {
    console.error('Failed to fetch JSON data:', error);
    ElMessage.error('加载规则代码失败');
    showCode.value = false; // 加载失败时不显示代码框
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
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

.view-icon {
  width: 20px;
  height: 20px;
  color: rgb(163, 199, 204);
}

.edit-btn:hover {
  background-color: transparent;
  border-color: transparent;
}

.edit-btn:hover .view-icon {
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

.code-dialog {
  width: 80%;
  max-width: 800px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
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

:deep(.el-select) {
  --el-select-bg-color: var(--bg-color) !important;
  --el-select-text-color: var(--text-color) !important;
  --el-select-border-color: var(--border-color) !important;
}

:deep(.el-select__wrapper) {
  background-color: var(--bg-color) !important;
}

:deep(.el-tooltip__trigger) {
  background-color: var(--bg-color) !important;
}
</style>
