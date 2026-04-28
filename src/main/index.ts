import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { registerAllIpcHandlers } from './ipc'
import { createWindow, showMainWindow } from './window/main'
import { createTray } from './window/tray'

// 请求单实例锁
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  // 监听第二个实例启动事件
  app.on('second-instance', () => {
    showMainWindow()
  })

  // 应用就绪
  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.zhike.app')

    // 注册 IPC 处理器
    registerAllIpcHandlers()

    // 监听窗口创建事件
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    createWindow()
    createTray()

    // macOS 特有：点击 Dock 图标时重新创建窗口
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
