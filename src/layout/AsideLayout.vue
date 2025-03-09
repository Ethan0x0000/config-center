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
      <el-menu-item index="/group">
        <template #title>
          <el-icon>
            <Icon icon="heroicons-outline:folder-open" width="24" height="24" />
          </el-icon>
          <span>分组</span>
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
    </el-menu>
  </el-scrollbar>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';

const route = useRoute();
const activeMenuKey = ref(route.path);

watch(() => route.path, (newPath) => {
  // 添加延迟以实现滞后效果
  setTimeout(() => {
    activeMenuKey.value = newPath;
  }, 150);
});

onMounted(() => {
  activeMenuKey.value = route.path;
});
</script>

<style scoped>
.scrollbar {
  height: calc(100% - 60px);
}

.side-menu {
  margin-top: 20px;
  width: 100%;
  border: none;
  background-color: transparent;
  color: var(--el-text-color-primary);
  border-right: none;
}

:deep(.el-menu-item) {
  position: relative;
  transition: all 0.3s ease-in-out;
  margin: 4px 0;
  border-radius: 6px;
  height: 50px;
  color: var(--el-text-color-regular);
}

:deep(.el-menu-item:hover) {
  background-color: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

:deep(.el-menu-item.is-active) {
  position: relative;
  background-color: var(--el-bg-color);
  color: var(--el-color-primary);
  font-weight: 500;
}

:deep(.el-sub-menu__title) {
  color: var(--el-text-color-regular);
}

:deep(.el-sub-menu__title:hover) {
  background-color: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: var(--el-color-primary);
  font-weight: 500;
}

:deep(.el-menu > .el-menu-item.is-active)::before,
:deep(.el-sub-menu.is-active > .el-sub-menu__title)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background-color: var(--el-color-primary);
  border-radius: 0 4px 4px 0;
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scaleX(1);
}

:deep(.el-menu > .el-menu-item:not(.is-active))::before,
:deep(.el-sub-menu:not(.is-active) > .el-sub-menu__title)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background-color: var(--el-color-primary);
  border-radius: 0 4px 4px 0;
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scaleX(0);
}

:deep(.el-sub-menu .el-menu-item.is-active)::before {
  display: none;
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: unset;
  background-color: transparent;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: var(--el-bg-color);
}

:deep(.el-icon) {
  color: inherit;
}
</style>
