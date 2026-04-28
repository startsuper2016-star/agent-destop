import { join } from 'path'
import * as fs from 'fs'
import { app, shell, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'

let mainWindow: BrowserWindow | null = null

/**
 * 获取窗口图标路径
 */
function getWindowIconPath(): string | undefined {
  const possiblePaths = [
    is.dev ? join(__dirname, '../../build/icon.png') : join(process.resourcesPath, 'icon.png'),
    join(__dirname, '../../build/icon.png'),
    join(__dirname, '../build/icon.png'),
    join(process.resourcesPath, 'build/icon.png'),
    join(app.getAppPath(), 'build/icon.png')
  ]

  for (const iconPath of possiblePaths) {
    if (fs.existsSync(iconPath)) {
      console.log('🎨 [Window Icon] Loading from:', iconPath)
      return iconPath
    }
  }

  console.warn('⚠️ [Window Icon] No icon found')
  return undefined
}

/**
 * 创建主窗口
 */
export function createWindow(): BrowserWindow {
  const iconPath = getWindowIconPath()

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

/**
 * 获取主窗口实例
 */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

/**
 * 显示并聚焦主窗口
 */
export function showMainWindow(): void {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  }
}
