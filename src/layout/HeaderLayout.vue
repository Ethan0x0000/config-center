<template>
  <div class="header-container">
    <el-button circle class="menu-btn" @click="store.commit('user/setAsideOpen', !store.state.user.asideOpen)">
      <div v-if="store.state.user.asideOpen">
        <Icon icon="ri:menu-unfold-3-line-2" width="28" height="28" />
      </div>
      <div v-if="!store.state.user.asideOpen">
        <Icon icon="ri:menu-unfold-4-line-2" width="28" height="28" />
      </div>
    </el-button>
    <div class="sub-container">
      <div class="title-container">
        <text class="title">Config Center</text>
      </div>
      <el-button circle class="theme-btn" @click="toggleTheme">
        <Icon :icon="themeIcon" width="24" height="24" />
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { useStore } from 'vuex';
import { computed } from 'vue';

const store = useStore();

const themeIcon = computed(() =>
  store.state.theme.currentTheme === 'light'
    ? 'ri:sun-line'
    : 'ri:moon-line'
);

const toggleTheme = () => {
  const newTheme = store.state.theme.currentTheme === 'light' ? 'dark' : 'light';
  store.commit('theme/setTheme', newTheme);
};
</script>

<style scoped>
.header-container {
  display: flex;
  width: 100%;
  height: 100%;
  padding: auto;
  align-items: center;
  margin-left: 10px;
  margin-right: 20px;
}

.menu-btn {
  border: none;
  background-color: transparent;
}

.theme-btn {
  border: none;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.theme-btn:hover {
  background-color: transparent;
  color: var(--primary-color);
}

.menu-btn:hover {
  background-color: transparent;
}

.sub-container {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  text-align: center;
  align-items: center;
}

.title-container {
  flex-grow: 1;
  display: flex;
  justify-content: center;
}

.title {
  min-width: 162px;
  font-size: 22px;
  font-weight: bold;
}
</style>
