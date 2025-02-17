import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import user from './modules/user'
import profile from './modules/profile'
import rule_sets from './modules/rule_sets'
import theme from './modules/theme'

export default createStore({
  modules: {
    user,
    profile,
    rule_sets,
    theme,
  },
  plugins: [
    createPersistedState({
      key: "Config Center",
      paths: ["user", "profile", "rule_sets", "theme"]
    })
  ]
})
