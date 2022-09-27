const { ipcRenderer } = require('electron')
const invoke = require('../invoke')('file')
const subscribe = require('../subscribe')('file')

module.exports = {
  file_subscribe: (path, listener) => subscribe('events')(path)(listener),
  file_clear_subscriptions: invoke('clear-subscriptions'),
  file_exists: invoke('exists'),
  file_is_directory: invoke('is-directory'),
  file_create: invoke('create'),
  file_create_directory: invoke('create-directory'),
  file_list_directory: invoke('list-directory'),
  file_contents: invoke('contents'),
  file_write: invoke('write'),
  file_rename: invoke('rename'),
  file_open: invoke('open'),
  file_delete: invoke('delete'),
  select_directory: invoke('select-directory'),
  directory_list: invoke('directory-list'),
  search_path: invoke('search-path'),
  search_next: invoke('search-next')
}
