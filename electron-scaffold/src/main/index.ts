import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

/**
 * 创建主窗口
 * 主进程负责管理应用生命周期、创建窗口、处理系统级事件
 */
function createWindow(): void {
  // 创建浏览器窗口实例
  const mainWindow = new BrowserWindow({
    width: 900,              // 窗口默认宽度
    height: 670,             // 窗口默认高度
    show: false,             // 初始不显示，等加载完成后再显示(避免白屏闪烁)
    autoHideMenuBar: true,   // 自动隐藏菜单栏(Windows/Linux)
    webPreferences: {
      // 预加载脚本路径：在页面渲染前注入，用于安全地暴露主进程API给渲染进程
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false         // 关闭沙箱(如需更高安全性可设为 true)
    }
  })

  // 窗口准备就绪后显示
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 拦截新窗口打开请求，改为用系统默认浏览器打开外部链接
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }  // 禁止在应用内打开新窗口
  })

  // 根据环境加载页面：开发环境使用 Vite 开发服务器，生产环境加载打包后的 HTML
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Electron 应用就绪后执行
app.whenReady().then(() => {
  // 设置应用用户模型ID(Windows 任务栏分组显示)
  electronApp.setAppUserModelId('com.zhike.app')

  // 监听窗口创建事件，优化窗口快捷键(如 F12 开发者工具)
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // macOS 特有：点击 Dock 图标时，如果没有窗口则重新创建
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 所有窗口关闭时的处理
app.on('window-all-closed', () => {
  // macOS 通常保持应用在后台运行(直到用户主动退出 Cmd+Q)
  // Windows/Linux 则直接退出应用
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
