const { execSync } = require('child_process')
const path = require('path')

/**
 * electron-builder 打包后钩子
 * 用于 macOS Ad-hoc 签名，解决未签名应用无法运行的问题
 */
exports.default = async function afterPack(context) {
  // 仅在 macOS 平台执行
  if (context.electronPlatformName !== 'darwin') return

  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`)

  console.log(`Ad-hoc re-signing: ${appPath}`)
  execSync(
    `codesign --force --deep --sign - "${appPath}"`,
    { stdio: 'inherit' }
  )
}
