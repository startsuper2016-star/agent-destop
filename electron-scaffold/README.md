# Electron Scaffold

Electron 脚手架项目，支持 Windows/Mac/Linux 跨平台打包。

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建预览
npm run build && npm run start
```

> 国内镜像已内置配置，无需额外设置。

## 打包发布

```bash
# Windows 安装包
npm run build:win

# macOS 安装包
npm run build:mac

# Linux 安装包
npm run build:linux
```

## 项目结构

```
src/
├── main/        # 主进程 - 窗口管理、IPC、原生API
├── preload/     # 预加载脚本 - 主进程与渲染进程通信桥梁
└── renderer/    # 渲染进程 - React UI
```

## IPC 通信

渲染进程通过 `window.electron.ipcRenderer` 与主进程通信：

```typescript
// 异步调用
const result = await window.electron.ipcRenderer.invoke('channel-name', data)

// 发送消息（无返回）
window.electron.ipcRenderer.send('channel-name', data)
```

添加新 IPC API：
1. `src/main/index.ts` - 添加 `ipcMain.handle()` 处理器
2. `src/preload/index.ts` - 在 `api` 对象中暴露方法
3. `src/preload/index.d.ts` - 添加类型声明

## 图标资源

打包前需准备图标文件放入 `build/` 目录：
- Windows: `icon.ico`
- macOS: `icon.icns`

## 技术栈

- Electron 33
- React 19
- TypeScript 5.6
- Vite 6
- electron-vite 3
- electron-builder 25