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
      <text class="title">Config Center</text>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { useStore } from 'vuex';

const store = useStore();
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

.title {
  min-width: 162px;
  font-size: 22px;
  font-weight: bold;
}
</style>
