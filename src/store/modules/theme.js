export default {
  namespaced: true,
  state: () => ({
    currentTheme: 'light',
    themes: {
      light: {
        '--bg-color': '#ffffff',
        '--text-color': '#303133',
        '--primary-color': '#409EFF',
        '--border-color': '#DCDFE6'
      },
      dark: {
        '--bg-color': '#1a1a1a',
        '--text-color': '#FFFFFF',
        '--primary-color': '#165DFF',
        '--border-color': '#4D4D4D'
      }
    }
  }),
  mutations: {
    setTheme(state, theme) {
      state.currentTheme = theme
      Object.entries(state.themes[theme]).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value)
      })
    }
  },
  getters: {
    currentTheme: state => state.currentTheme
  }
}
