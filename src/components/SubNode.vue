<template>
  <el-card shadow="hover" style="width: 100%; margin-top: 20px;">
    <template #header>
      <div class="card-header" style="display: flex; justify-content: center;">
        <el-text type="primary" size="large">订阅管理</el-text>
      </div>
    </template>
    <VueDraggable v-model="subs" handle=".drag-handle" :animation="150" ghostClass="ghost">
      <div class="sub-list" v-for="item in subs" :key="item.id">
        <el-card class="sub-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <Icon class="drag-handle" icon="system-uicons:drag" width="32" height="32" />
              <div style="display: flex; flex-direction: row; align-items: center; gap: 10px;">
                <el-button style="width: 32px;border: none;" @click="getSubNodes(item)" :loading="isLoading[item.id]">
                  <Icon icon="mingcute:refresh-3-line" width="24" height="24" />
                </el-button>
                <el-text>{{ item.name }}</el-text>
              </div>
              <div class="header-btn">
                <el-tooltip placement="top" content="点击编辑" effect="light">
                  <el-button style="width: 32px;border: none;" @click="handleEdit(item)">
                    <Icon icon="mingcute:edit-line" width="24" height="24" />
                  </el-button>
                </el-tooltip>
                <el-popconfirm title="确认删除该配置?" @confirm="store.commit('profile/deleteSub', item.id)"
                  :confirm-button-text="'确定'" :cancel-button-text="'取消'">
                  <template #reference>
                    <el-button class="delete-btn" style="width: 32px;border: none;">
                      <Icon class="delete-icon" icon="material-symbols:delete-outline" width="24" height="24" />
                    </el-button>
                  </template>
                </el-popconfirm>
              </div>
            </div>
          </template>
          <div style="display: flex; justify-content: space-between; margin-top: 10px;">
            <el-text>节点数量：{{ item.subNodes.length }}</el-text>
            <el-text>启用数量：{{ item.usedNodes.length }}</el-text>
            <el-text>剩余流量：{{ item.remainingData }}</el-text>
            <el-text>套餐到期：{{ item.expirationDate }}</el-text>
          </div>
        </el-card>
      </div>
    </VueDraggable>
    <el-button type="primary" class="add-btn" @click="handleNew" style="width: 100%; margin-top: 10px;">
      <Icon icon="mdi:plus" width="18" height="18" />
      <span>添加订阅</span>
    </el-button>
  </el-card>
  <el-dialog title="编辑订阅" v-model="editDialogVisible" width="30%" align-center :id="editSub.id">
    <div style="display: flex; flex-direction: row; gap:10px;">
      <el-checkbox v-model="editSub.isUse" label="启用订阅" size="large" @change="highlightSaveButton = 'primary'" />
      <el-checkbox v-model="editSub.isGroup" label="建立分组" size="large" @change="highlightSaveButton = 'primary'" />
      <el-tooltip placement="right" content="启用后可以解决部分节点无法获取的问题(仅适用于订阅链接)" effect="light">
        <el-checkbox v-model="editSub.isEnhanced" label="增强订阅" size="large" />
      </el-tooltip>
    </div>
    <el-input v-model="editSub.name" placeholder="请输入订阅名称" size="large" style="margin-top: 10px;" />
    <el-input v-model="editSub.url" placeholder="请输入订阅地址或BASE64信息" size="large" style="margin-top: 10px;" clearable>
      <template #append>
        <el-button @click="getSubNodes(editSub)" :disabled="editSub.url === ''" :loading="isLoading[editSub.id]">
          <el-text :type="editSub.url !== '' ? 'primary' : 'default'">获取</el-text>
        </el-button>
      </template>
    </el-input>
    <div style="display: flex;flex-wrap: wrap; flex-direction: row; gap:10px; margin-top: 20px;">
      <div v-for="(node, index) in editSub.subNodes" :key="index">
        <el-card v-if="editSub.usedNodes.includes(index)"
          @click="editSub.usedNodes.splice(editSub.usedNodes.indexOf(index), 1)"
          body-style="padding: 5px;color: white;background-color:  RGB(64,158,255);" shadow="never"
          style="width: auto;margin: 0 0 0 0;border-radius: 20px;cursor: pointer;">
          {{ node.name }}
        </el-card>
        <el-card v-else @click="editSub.usedNodes.push(index)" body-style="padding: 5px;" shadow="never"
          style="width: auto;margin: 0 0 0 0;border-radius: 20px;cursor: pointer;">
          {{ node.name }}
        </el-card>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button :type="highlightSaveButton" @click="handleSaveEdit">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, reactive } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useStore } from 'vuex';
import { Icon } from '@iconify/vue';
import axios from 'axios';
import { v4 as uuidV4 } from 'uuid';
import { ElMessage } from 'element-plus';

const editDialogVisible = ref(false);
const highlightSaveButton = ref('');
const available = ref(false);
const isLoading = reactive({});
const editSub = ref({});

const store = useStore();
const currentProfileID = computed(() => store.state.profile.currentProfileID);
const subs = computed({
  get: () => store.state.profile.subs,
  set: (val) => store.commit('profile/setSubs', val),
});

const handleEdit = (item) => {
  editDialogVisible.value = true;
  editSub.value = item;
};

const handleNew = () => {
  store.commit('profile/addSub');
  editSub.value = store.state.profile.subs[store.state.profile.subs.length - 1];
  editDialogVisible.value = true;
};

function removeDuplicates(arrA, arrB, prop) {
  // 创建 Set 存储 arrA 中元素的指定属性对象
  const propValuesInA = new Set(arrA.map(item => JSON.stringify(item[prop])));

  // 过滤 arrB,移除指定属性对象在 arrA 中存在的元素
  const filteredArrB = arrB.filter(item => {
    const propValue = item[prop];
    return !propValuesInA.has(JSON.stringify(propValue));
  });

  return filteredArrB;
}
const handleSaveEdit = () => {
  store.commit('profile/setSub', editSub);
  editDialogVisible.value = false;
  if (editSub.value.isUse && !editSub.value.isGroup && editSub.value.usedNodes.length !== 0) {
    let nodes = store.state.profile.nodeList;
    let addNodes = editSub.value.usedNodes.map(index => {
      return {
        id: uuidV4(),
        name: editSub.value.subNodes[index].name,
        content: editSub.value.subNodes[index].content
      }
    });
    let filteredNodes = removeDuplicates(nodes, addNodes, 'content');
    if (filteredNodes.length !== 0) {
      store.commit('profile/setNodeList', nodes.concat(filteredNodes));
      for (let i = 0; i < filteredNodes.length; i++) {
        store.commit('profile/addNodeID', { profileID: currentProfileID.value, nodeID: filteredNodes[i].id })
      }
    }
  }
};

function decode(str) {
  const decodedString = atob(str);
  const encodedString = encodeURIComponent(decodedString).replace(/%0D%0A/g, '%7C');
  return encodedString;
}
function isBase64(str) {
  // Base64 字符正则表达式
  const base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;

  // 如果字符串为空或不是字符串类型,返回 false
  if (!str || typeof str !== 'string') {
    return false;
  }

  // 使用正则表达式测试字符串是否为 Base64 编码
  return base64Regex.test(str);
}

const getSubNodes = async (sub) => {
  isLoading[sub.id] = true;
  try {
    let url = sub.url;
    if (!sub.isEnhanced) {
      let content = '';
      if (isBase64(sub.url)) {
        content = decode(sub.url);
      } else {
        const res = await axios.get(url);
        content = decode(res.data);
      }
      // console.log(content);
      url = 'https://url.v1.mk/sub?target=singbox&url=' + content + '&insert=false&emoji=true&list=true&xudp=true&udp=true&tfo=false&expand=false&scv=true&fdn=false&singbox.ipv6=1'
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      sub.subNodes = data.outbounds.map(node => ({ name: node.tag, content: node }));
    } else {
      url = url + '&flag=sing-box&types=all';
      const response = await axios.get(url);
      const data = response.data;
      sub.subNodes = data.outbounds.filter(item => item.type !== 'selector' && item.type !== 'urltest' && item.type !== 'direct' && item.type !== 'block' && item.type !== 'dns').map(node => ({ name: node.tag, content: node }));
    }
    sub.subNodes.forEach(item => {
      const { name } = item;

      // 检查 name 是否包含 "剩余流量"
      const remainingDataMatch = name.match(/剩余流量：(.+)/);
      if (remainingDataMatch) {
        sub.remainingData = remainingDataMatch[1];
      }

      // 检查 name 是否包含 "套餐到期"
      const expirationDateMatch = name.match(/套餐到期：(.+)/);
      if (expirationDateMatch) {
        sub.expirationDate = expirationDateMatch[1];
      }
    });
    ElMessage.success('获取成功');
    available.value = false;
  } catch (error) {
    console.log(error);
    ElMessage.error('获取失败');
  }
  isLoading[sub.id] = false;
};
</script>

<style scoped>
.sub-list {
  margin-bottom: 10px;
}

.drag-handle {
  cursor: move;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-btn:hover {
  background-color: transparent;
}

.delete-btn:active {
  background-color: transparent;
}

.delete-icon {
  color: #dd7171;
}

.delete-btn:hover .delete-icon {
  color: #ff0000;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>