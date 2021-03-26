module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        npmRebuild: false,
        win: {
          icon: './assets/icon/tome.ico'
        }
      }
    }
  },
  transpileDependencies: [
    'vuetify'
  ]
}
