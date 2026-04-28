import { join } from 'path'
import * as fs from 'fs'
import { app, Tray, Menu, nativeImage } from 'electron'
import { is } from '@electron-toolkit/utils'
import { showMainWindow } from './main'

let tray: Tray | null = null

/**
 * 获取托盘图标路径
 */
function getTrayIconPath(): string {
  if (is.dev) {
    return join(__dirname, '../../build/icon.png')
  }
  return join(process.resourcesPath, 'icon.png')
}

/**
 * 创建系统托盘
 */
export function createTray(): Tray {
  let trayIconPath = getTrayIconPath()

  // 如果图标不存在，尝试其他路径
  if (!fs.existsSync(trayIconPath)) {
    const fallbackPaths = [
      join(__dirname, '../../build/icon.png'),
      join(__dirname, '../build/icon.png'),
      join(process.resourcesPath, 'build/icon.png'),
      join(app.getAppPath(), 'build/icon.png')
    ]

    for (const fallback of fallbackPaths) {
      if (fs.existsSync(fallback)) {
        trayIconPath = fallback
        break
      }
    }
  }

  console.log('🎨 [Tray] Loading icon from:', trayIconPath)

  if (fs.existsSync(trayIconPath)) {
    const icon = nativeImage.createFromPath(trayIconPath)
    const trayIcon = icon.resize({ width: 16, height: 16 })
    tray = new Tray(trayIcon)
  } else {
    console.warn('⚠️ [Tray] Icon not found, using default')
    const emptyIcon = nativeImage.createEmpty()
    tray = new Tray(emptyIcon)
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => showMainWindow()
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => app.quit()
    }
  ])

  tray.setToolTip('智壳 - Zhike')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    const mainWindow = require('./main').getMainWindow()
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })

  return tray
}
