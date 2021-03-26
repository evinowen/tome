const { MSICreator } = require('electron-wix-msi')
const path = require('path')

let interval;

async function execute () {
  const appDirectory = path.resolve(__dirname, '../dist_electron/win-unpacked')
  const outputDirectory = path.resolve(__dirname, '../dist_electron/win-packed')

  const creator = new MSICreator({
    appDirectory,
    description: 'Git integrated markdown pseudoeditor application based on Electron',
    exe: 'tome',
    name: 'Tome',
    version: '0.0.0',
    outputDirectory
  });

  await creator.create()
  await creator.compile()

  if (interval) {
    clearInterval(interval)
  }
}

execute()
  .catch((e) => { console.log(e) })
  .finally(() => { process.exit() })

interval = setInterval(() => process.stdout.write('.'), 1000)
