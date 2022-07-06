window.api = {
  ...require('./components/clipboard/preload'),
  ...require('./components/git/preload'),
  ...require('./components/file/preload'),
  ...require('./components/metadata/preload'),
  ...require('./components/path/preload'),
  ...require('./components/window/preload')
}
