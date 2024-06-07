<template>
  <el-scrollbar class="scrollbar">
    <el-menu class="side-menu" :default-active="activeMenuKey" mode="vertical" router>
      <el-menu-item index="/board">
        <template #title>
          <el-icon>
            <Icon icon="mdi:view-dashboard" style="position: relative;top: -1px;" />
          </el-icon>
          <span>面板</span>
        </template>
      </el-menu-item>
      <el-menu-item index="/setting">
        <template #title>
          <el-icon>
            <Icon icon="uil:setting" style="position: relative;top: -1px;" />
          </el-icon>
          <span>配置</span>
        </template>
      </el-menu-item>
      <el-menu-item index="/node">
        <template #title>
          <el-icon>
            <Icon icon="ri:node-tree" style="position: relative;top: -1px;" />
          </el-icon>
          <span>节点</span>
        </template>
      </el-menu-item>
      <el-menu-item index="/rule">
        <template #title>
          <el-icon>
            <Icon icon="ic:baseline-list-alt" style="position: relative;top: -1px;" />
          </el-icon>
          <span>规则</span>
        </template>
      </el-menu-item>
      <!-- <el-menu-item index="/test">
        <template #title>
          <span>测试</span>
        </template>
      </el-menu-item> -->
    </el-menu>
  </el-scrollbar>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';

const route = useRoute();
const activeMenuKey = ref('');


onMounted(() => {
  activeMenuKey.value = route.path;
});

watch(
  () => route.path,
  (newPath) => {
    activeMenuKey.value = newPath;
  }
);

</script>

<style scoped>
.scrollbar {
  height: calc(100% - 60px);
}

.side-menu {
  margin-top: 20px;
  width: 100%;
  border: none;
}

.side-menu :deep(.el-menu-item.is-active) {
  border-right: 3px solid #409eff;
  background-color: #ecf5ff;
}
</style>
