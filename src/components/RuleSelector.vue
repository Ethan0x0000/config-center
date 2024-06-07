<template>
  <el-scrollbar max-height="360px">
    <div style="margin:10px;">
      <VueDraggable v-model="items" handle=".drag-handle" :animation="150" ghostClass="ghost">
        <div class="list-item" v-for="item in items" :key="item.id">
          <!-- 这里的handle是用来拖动的 -->
          <div class="drag-handle">
            <Icon icon="mdi:drag-vertical-variant" height="28" width="auto" />
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
          <el-button class="view-btn" @click="handleView(item)" color="transparent" circle>
            <Icon icon="fa6-solid:code" class="view-icon" />
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
    <CodeDisplay :key="dialogVisible" :content="jsonData" :readOnly="readOnly" />
  </el-dialog>
</template>

<script setup>
import CodeDisplay from '@/components/CodeDisplay.vue'

import { useStore } from 'vuex';
import { ref, defineProps, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { VueDraggable } from 'vue-draggable-plus';
import { ElLoading } from 'element-plus';

const store = useStore();
const dialogVisible = ref(false);
const jsonData = ref('');
const readOnly = true;
const loading = ref(null); // 用于控制加载动画

const props = defineProps({
  module: {
    type: String,
    default: "proxyRules",
    required: true
  }
});

const currentProfileID = computed({
  get: () => store.state.profile.currentProfileID,
  set: (id) => store.commit('profile/setCurrentProfileID', id)
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
    // 修改URL，将末端的.srs改为.json
    const modifiedUrl = item.url.replace(/\.srs$/, '.json');
    try {
      // 开启全屏加载动画
      loading.value = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)',
      });

      const response = await fetch(modifiedUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      jsonData.value = await response.text();
      dialogVisible.value = true;
    } catch (error) {
      console.error('Failed to fetch JSON data:', error);
    } finally {
      // 关闭全屏加载动画
      loading.value.close();
    }
  }
};
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

.view-icon {
  width: 20px;
  height: 20px;
  color: rgb(163, 199, 204);
}

.view-btn:hover {
  background-color: transparent;
  border-color: transparent;
}

.view-btn:hover .view-icon {
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
</style>
