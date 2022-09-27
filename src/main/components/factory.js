const { ipcMain } = require('electron')
const log = require('electron-log')

const handle = (channel, listener) => {
  ipcMain.handle(channel, async (...parameters) => {
    log.info(`Handle ${channel}`)
    return await listener(...parameters)
  })
}

const event = (channel, listener) => {
  ipcMain.on(channel, async (...parameters) => {
    log.info(`Event ${channel}`)
    return await listener(...parameters)
  })
}

module.exports = (register, data) => ({
  register: (win) => register({ handle, on: event }, win),
  data
})
