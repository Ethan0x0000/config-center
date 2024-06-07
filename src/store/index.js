import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import user from './modules/user'
import profile from './modules/profile'
import rule_sets from './modules/rule_sets'

export default createStore({
  modules: {
    user,
    profile,
    rule_sets,
  },
  plugins: [
    createPersistedState({
      key: "Config Center",
      paths: ["user", "profile", "rule_sets"]
    })
  ]
})
