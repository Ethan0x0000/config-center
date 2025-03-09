export default {
  namespaced: true,
  state: () => ({
    currentTheme: '',
    themes: {
      light: {
        '--bg-color': '#ffffff',
        '--text-color': '#303133',
        '--primary-color': '#409EFF',
        '--border-color': '#DCDFE6',
        '--el-menu-hover-bg-color': '#f5f7fa',
        '--el-menu-active-color': '#409EFF',
        '--el-bg-color': '#ffffff',
        '--el-bg-color-overlay': '#ffffff',
        '--el-text-color-primary': '#303133',
        '--el-text-color-regular': '#606266',
        '--el-color-primary': '#409EFF',
        '--el-fill-color-light': '#f5f7fa'
      },
      dark: {
        '--bg-color': '#242424',
        '--text-color': '#FFFFFF',
        '--primary-color': '#165DFF',
        '--border-color': '#4D4D4D',
        '--el-menu-hover-bg-color': '#2d2d2d',
        '--el-menu-active-color': '#165DFF',
        '--el-bg-color': '#242424',
        '--el-bg-color-overlay': '#242424',
        '--el-text-color-primary': '#FFFFFF',
        '--el-text-color-regular': '#FFFFFF',
        '--el-color-primary': '#165DFF',
        '--el-fill-color-light': '#2d2d2d'
      }
    }
  }),
  mutations: {
    setTheme(state, theme) {
      state.currentTheme = theme
      localStorage.setItem('theme', theme)
      Object.entries(state.themes[theme]).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value)
      })
    }
  }
}
