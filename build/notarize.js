require('dotenv').config()
const { notarize } = require('@electron/notarize')

exports.default = async function notarizing (context) {
  const { electronPlatformName, appOutDir } = context
  console.log('Notarize Platform Check', electronPlatformName, appOutDir)

  if (electronPlatformName !== 'darwin') {
    console.log('Notarize Not Required', electronPlatformName)
    return
  }

  const appName = context.packager.appInfo.productFilename

  const config = {
    tool: 'notarytool',
    appBundleId: 'com.evinowen.tome',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD
  }

  console.log('Notarize', config)

  return await notarize(config)
}
