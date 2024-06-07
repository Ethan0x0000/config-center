const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

})

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
module.exports = {
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin()
    ]
  },
}
