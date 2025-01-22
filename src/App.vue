<template>
  <div class="app">
    <div class="view-zone" ref="viewZoneRef">
      <div class="header">
        <HeaderLayout />
      </div>
      <div class="container">
        <transition name="slide">
          <div class="aside" v-show="store.state.user.asideOpen" :style="{ width: store.state.user.asideWidth + 'px' }">
            <AsideLayout />
          </div>
        </transition>
        <div class="content">
          <el-scrollbar class="scrollbar">
            <div class="main">
              <ContentLayout />
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderLayout from './layout/HeaderLayout.vue'
import AsideLayout from './layout/AsideLayout.vue'
import ContentLayout from './layout/ContentLayout.vue'

import { useStore } from 'vuex'
import { onMounted, onUnmounted, ref } from 'vue'

const store = useStore()

// 从localStorage加载用户偏好
const loadUserPreference = () => {
  const asideOpen = localStorage.getItem('asideOpen')
  const asideWidth = localStorage.getItem('asideWidth')

  if (asideOpen !== null) {
    store.commit('user/setAsideOpen', asideOpen === 'true')
  }

  if (asideWidth !== null) {
    store.commit('user/setAsideWidth', parseInt(asideWidth))
  }
}

const viewZoneRef = ref(null)
const breakpointWidth = 768 // 设置断点宽度为 768px
// 监听 .view-zone 元素宽度变化
let resizeObserver = null
let resizeTimeout = null

function handleResize() {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    if (viewZoneRef.value.offsetWidth < breakpointWidth) {
      store.commit('user/setAsideOpen', false)
    } else {
      store.commit('user/setAsideOpen', true)
    }
  }, 200) // 延迟 200 毫秒执行
}

onMounted(() => {
  loadUserPreference()
  handleResize() // 初始时检查一次
  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(viewZoneRef.value)

  // 监听侧栏状态变化
  store.watch(
    (state) => state.user.asideOpen,
    (newVal) => {
      localStorage.setItem('asideOpen', newVal)
    }
  )

  // 监听侧栏宽度变化
  store.watch(
    (state) => state.user.asideWidth,
    (newVal) => {
      localStorage.setItem('asideWidth', newVal)
    }
  )

  //页面加载时先初始化规则集和配置信息
  store.dispatch("rule_sets/initRuleSets")
  store.dispatch('profile/initProfile')
})

onUnmounted(() => {
  resizeObserver.disconnect()
})
</script>

<style scoped>
html,
body,
#app {
  display: flex;
  flex-direction: column;
}

.app {
  display: flex;
  justify-content: center;
}

.view-zone {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 18px);
  width: 100%;
  max-width: 1440px;
}

.header {
  display: flex;
  height: 60px;
  box-shadow: 0 0px 5px rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.container {
  display: flex;
  flex-direction: row;
  height: calc(100% - 60px);
}

.aside {
  min-width: 150px;
  width: 15%;
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.3);
}

.content {
  flex: 1;
  position: relative;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  transition: width 0.3s ease;
}

.scrollbar {
  width: 100%;
}

.main {
  padding: 20px;
}
</style>
