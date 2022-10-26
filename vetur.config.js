/** @type {import('vls').VeturConfig} */
module.exports = {
  settings: {
    "vetur.useWorkspaceDependencies": true,
    "vetur.experimental.templateInterpolationService": true
  },
  projects: [
    {
      root: './src/main',
      package: '../../package.json',
      tsconfig: './tsconfig.json'
    },
    {
      root: './src/renderer',
      package: '../../package.json',
      tsconfig: '../../tsconfig.json'
    }
  ]
}
