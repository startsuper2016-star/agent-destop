import { app, shell, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

// 宠物窗口实例
let petWindow: BrowserWindow | null = null
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

// Gemini API 配置
const GEMINI_MODEL = 'gemini-2.5-flash-lite'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

// 技能保存目录
const SKILLS_DIR_NAME = '.zhike'
const SKILLS_SUBDIR = 'skills'

/**
 * 获取代理 URL
 * 优先级: HTTPS_PROXY > HTTP_PROXY > ALL_PROXY (支持大小写)
 */
function getProxyUrl(): string | undefined {
  return (
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.ALL_PROXY ||
    process.env.https_proxy ||
    process.env.http_proxy ||
    process.env.all_proxy
  )
}

/**
 * 获取技能保存目录路径
 */
function getSkillsDir(): string {
  return path.join(os.homedir(), SKILLS_DIR_NAME, SKILLS_SUBDIR)
}

/**
 * 注册 IPC 处理器
 */
function registerIpcHandlers(): void {
  // 环境检测
  ipcMain.handle('env:check', async () => {
    const skillsDir = getSkillsDir()
    const exists = fs.existsSync(skillsDir)
    return {
      os: os.platform(),
      isCliInstalled: exists,
      skillsDirExists: exists,
      skillsDir
    }
  })

  // 保存技能
  ipcMain.handle('skill:save', async (_event, { name, content }: { name: string; content: string }) => {
    if (!name || !content) {
      return { error: '技能名称和内容不能为空', status: 400 }
    }

    // 安全处理名称，防止路径遍历攻击
    const safeName = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()
    const skillsDir = getSkillsDir()
    const targetDir = path.join(skillsDir, safeName)
    const filePath = path.join(targetDir, 'SKILL.md')

    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
      }
      fs.writeFileSync(filePath, content, 'utf8')
      return { success: true, path: filePath }
    } catch (error: any) {
      console.error('❌ [Save Error]:', error.message)
      return { error: `保存失败: ${error.message}`, status: 500 }
    }
  })

  // AI 生成技能内容
  ipcMain.handle('skill:generate', async (_event, { prompt, apiKey }: { prompt: string; apiKey: string }) => {
    if (!apiKey) {
      return { error: '请先在设置中配置 API Key', status: 401 }
    }

    const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`
    const proxyUrl = getProxyUrl()

    const systemPrompt = `你是一个资深的 Gemini CLI Agent Skill 架构师。
你的任务是根据用户的需求，生成一个符合规范的 SKILL.md 文件内容。

规范要求：
1. 必须包含 YAML Frontmatter (name 和 description)。
2. 必须包含 # Instructions 标题。
3. 指令必须清晰、具体，使用祈使句。
4. 输出必须仅包含 Markdown 内容。

用户需求：${prompt}`

    try {
      const response = await fetchGemini(url, proxyUrl, systemPrompt)
      return response
    } catch (error: any) {
      console.error('❌ [Generate Error]:', error.message)
      return { error: `AI 生成失败: ${error.message}`, status: 500 }
    }
  })

  // 测试 API Key
  ipcMain.handle('apiKey:test', async (_event, { apiKey }: { apiKey: string }) => {
    if (!apiKey) {
      return { success: false, error: '请先输入 API Key', status: 401 }
    }

    const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }]
        })
      })

      const data = await response.json()

      if (data.error) {
        return { success: false, error: data.error.message, status: 400 }
      }

      if (data.candidates && data.candidates[0]) {
        return { success: true, message: '连接成功！' }
      }

      return { success: false, error: '响应格式不正确', status: 500 }
    } catch (error: any) {
      console.error('❌ [API ERROR]:', error.message)
      return { success: false, error: `连接失败: ${error.message}`, status: 500 }
    }
  })

  // 获取技能列表
  ipcMain.handle('skill:list', async () => {
    const skillsDir = getSkillsDir()

    if (!fs.existsSync(skillsDir)) {
      return { skills: [] }
    }

    try {
      const entries = fs.readdirSync(skillsDir, { withFileTypes: true })
      const skills = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => {
          const skillPath = path.join(skillsDir, entry.name)

          // 获取修改时间
          const stats = fs.statSync(skillPath)

          return {
            name: entry.name,
            path: skillPath,
            size: stats.size,
            modified: stats.mtime.toISOString()
          }
        })
        .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())

      return { skills }
    } catch (error: any) {
      console.error('❌ [List Error]:', error.message)
      return { skills: [], error: error.message }
    }
  })

  // 删除技能
  ipcMain.handle('skill:delete', async (_event, { name }: { name: string }) => {
    if (!name) {
      return { error: '技能名称不能为空', status: 400 }
    }

    const safeName = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()
    const skillsDir = getSkillsDir()
    const targetDir = path.join(skillsDir, safeName)

    if (!fs.existsSync(targetDir)) {
      return { error: '技能不存在', status: 404 }
    }

    try {
      fs.rmSync(targetDir, { recursive: true, force: true })
      return { success: true }
    } catch (error: any) {
      console.error('❌ [Delete Error]:', error.message)
      return { error: `删除失败: ${error.message}`, status: 500 }
    }
  })

  // 读取技能内容
  ipcMain.handle('skill:read', async (_event, { name }: { name: string }) => {
    if (!name) {
      return { error: '技能名称不能为空', status: 400 }
    }

    const safeName = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()
    const skillsDir = getSkillsDir()
    const filePath = path.join(skillsDir, safeName, 'SKILL.md')

    if (!fs.existsSync(filePath)) {
      return { error: '技能不存在', status: 404 }
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8')
      return { success: true, content }
    } catch (error: any) {
      console.error('❌ [Read Error]:', error.message)
      return { error: `读取失败: ${error.message}`, status: 500 }
    }
  })

  // ========== 桌面宠物 IPC 处理器 ==========

  // 宠物窗口移动
  ipcMain.on('pet:move', (_event, { x, y }: { x: number; y: number }) => {
    if (petWindow && !petWindow.isDestroyed()) {
      petWindow.setPosition(Math.round(x), Math.round(y))
    }
  })

  // 宠物窗口调整大小
  ipcMain.on('pet:resize', (_event, { width, height }: { width: number; height: number }) => {
    if (petWindow && !petWindow.isDestroyed()) {
      const [x, y] = petWindow.getPosition()
      const currentSize = petWindow.getSize()
      // 保持中心点不变调整大小
      const newX = x + (currentSize[0] - width) / 2
      const newY = y + (currentSize[1] - height) / 2
      petWindow.setBounds({
        x: Math.round(newX),
        y: Math.round(newY),
        width,
        height
      })
    }
  })

  // 宠物窗口点击穿透
  ipcMain.on('pet:click-through', (_event, enable: boolean) => {
    if (petWindow && !petWindow.isDestroyed()) {
      petWindow.setIgnoreMouseEvents(enable, { forward: true })
    }
  })

  // 打开主窗口
  ipcMain.on('pet:open-main', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // 隐藏宠物窗口
  ipcMain.on('pet:hide', () => {
    if (petWindow && !petWindow.isDestroyed()) {
      petWindow.hide()
    }
  })

  // 执行文件任务
  ipcMain.on('pet:execute-task', async (_event, { filePath, skill }: { filePath: string; skill: string }) => {
    console.log(`🐾 [Pet Task] Executing ${skill} on ${filePath}`)

    try {
      // 读取文件内容
      const content = fs.readFileSync(filePath, 'utf8')
      const fileName = path.basename(filePath)

      // 根据技能类型处理
      let result = ''
      switch (skill) {
        case 'json-formatter':
          result = JSON.stringify(JSON.parse(content), null, 2)
          break
        case 'markdown-formatter':
          // 简单的 Markdown 格式化
          result = content
            .replace(/^\s+/gm, '')
            .replace(/\n{3,}/g, '\n\n')
          break
        case 'text-analyzer':
          const lines = content.split('\n').length
          const words = content.split(/\s+/).length
          const chars = content.length
          result = `# 文本分析报告\n\n- 行数: ${lines}\n- 词数: ${words}\n- 字符数: ${chars}\n- 文件: ${fileName}`
          break
        default:
          // 其他技能返回分析结果
          result = `# 文件分析报告\n\n技能: ${skill}\n文件: ${fileName}\n大小: ${fs.statSync(filePath).size} bytes\n\n已为您完成分析！`
      }

      // 保存结果到桌面
      const desktopPath = path.join(os.homedir(), 'Desktop')
      const resultFileName = `${path.basename(fileName, path.extname(fileName))}_result.md`
      const resultPath = path.join(desktopPath, resultFileName)
      fs.writeFileSync(resultPath, result, 'utf8')

      // 通知宠物窗口任务完成
      if (petWindow && !petWindow.isDestroyed()) {
        petWindow.webContents.send('pet:task-complete', {
          success: true,
          message: `已保存到桌面: ${resultFileName}`
        })
      }

      console.log(`✅ [Pet Task] Completed: ${resultPath}`)
    } catch (error: any) {
      console.error('❌ [Pet Task Error]:', error.message)
      if (petWindow && !petWindow.isDestroyed()) {
        petWindow.webContents.send('pet:task-complete', {
          success: false,
          error: error.message
        })
      }
    }
  })
}

/**
 * 调用 Gemini API
 */
async function fetchGemini(url: string, proxyUrl: string | undefined, prompt: string): Promise<{ content: string } | { error: string; status: number }> {
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
  })

  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  }

  try {
    // 尝试使用代理
    if (proxyUrl) {
      console.log('📡 [Backend] Attempting fetch via proxy:', proxyUrl)
      const { ProxyAgent } = await import('undici')
      const response = await fetch(url, {
        ...fetchOptions,
        dispatcher: new ProxyAgent(proxyUrl)
      } as any)
      const data = await response.json()
      if (data.error) {
        return { error: data.error.message, status: 400 }
      }
      return { content: data.candidates[0].content.parts[0].text }
    }
  } catch (proxyError: any) {
    console.log('⚠️ [Backend] Proxy request failed, fallback to direct:', proxyError.message)
  }

  // 直接连接
  console.log('📡 [Backend] Attempting direct fetch (no proxy configured)')
  const response = await fetch(url, fetchOptions)
  const data = await response.json()

  if (data.error) {
    return { error: data.error.message, status: 400 }
  }

  return { content: data.candidates[0].content.parts[0].text }
}

/**
 * 创建宠物窗口
 * 桌面悬浮宠物，透明背景，可拖动
 */
function createPetWindow(): void {
  const { screen } = require('electron')
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  petWindow = new BrowserWindow({
    width: 200,
    height: 200,
    x: width - 220,
    y: height - 220,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    focusable: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // 加载宠物页面
  const petPath = is.dev
    ? join(__dirname, '../renderer/pet/index.html')
    : join(process.resourcesPath, 'pet/index.html')

  petWindow.loadFile(petPath)

  petWindow.on('ready-to-show', () => {
    petWindow?.show()
  })

  petWindow.on('closed', () => {
    petWindow = null
  })
}

/**
 * 获取窗口图标路径
 */
function getWindowIconPath(): string | undefined {
  // 可能的图标路径
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
 * 主进程负责管理应用生命周期、创建窗口、处理系统级事件
 */
function createWindow(): void {
  // 获取窗口图标
  const iconPath = getWindowIconPath()

  // 创建浏览器窗口实例
  mainWindow = new BrowserWindow({
    width: 1200,             // 窗口默认宽度
    height: 800,             // 窗口默认高度
    show: false,             // 初始不显示，等加载完成后再显示(避免白屏闪烁)
    autoHideMenuBar: true,   // 自动隐藏菜单栏(Windows/Linux)
    icon: iconPath,          // 窗口图标
    webPreferences: {
      // 预加载脚本路径：在页面渲染前注入，用于安全地暴露主进程API给渲染进程
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false         // 关闭沙箱(如需更高安全性可设为 true)
    }
  })

  // 窗口准备就绪后显示
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
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

/**
 * 创建系统托盘
 */
function createTray(): void {
  // 托盘图标路径 - 开发环境和生产环境
  let trayIconPath: string

  if (is.dev) {
    // 开发环境：使用 build 目录下的图标
    trayIconPath = join(__dirname, '../../build/icon.png')
  } else {
    // 生产环境：使用打包后的 resources 目录
    trayIconPath = join(process.resourcesPath, 'icon.png')
  }

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
    // 创建托盘图标并设置大小（Windows 托盘图标推荐 16x16）
    const { nativeImage } = require('electron')
    const icon = nativeImage.createFromPath(trayIconPath)
    // 缩放为适合托盘的大小
    const trayIcon = icon.resize({ width: 16, height: 16 })
    tray = new Tray(trayIcon)
  } else {
    console.warn('⚠️ [Tray] Icon not found, using default')
    // 创建一个空白图标作为后备
    const { nativeImage } = require('electron')
    const emptyIcon = nativeImage.createEmpty()
    tray = new Tray(emptyIcon)
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: '显示/隐藏宠物',
      click: () => {
        if (petWindow) {
          if (petWindow.isVisible()) {
            petWindow.hide()
          } else {
            petWindow.show()
          }
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('智壳 - Zhike')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })
}

// Electron 应用就绪后执行
app.whenReady().then(() => {
  // 设置应用用户模型ID(Windows 任务栏分组显示)
  electronApp.setAppUserModelId('com.zhike.app')

  // 注册 IPC 处理器
  registerIpcHandlers()

  // 监听窗口创建事件，优化窗口快捷键(如 F12 开发者工具)
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createPetWindow()
  createTray()

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
