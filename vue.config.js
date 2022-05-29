module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    target: 'electron-renderer'
  }
}
