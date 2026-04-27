import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

/**
 * 预加载脚本(Preload Script)
 * 作用：在渲染进程和主进程之间建立安全的桥梁
 * 特点：预加载脚本可以访问 Node.js 和 Electron API，但普通渲染页面不行
 * 安全：通过 contextBridge 只暴露必要的 API，避免直接暴露完整 ipcRenderer
 */

// 自定义 API 对象：在这里添加渲染进程需要调用的主进程功能
const api = {
  // 示例：ping 方法，通过 invoke 向主进程发送异步请求并等待响应
  ping: () => ipcRenderer.invoke('ping')
}

// 检查是否启用了上下文隔离(推荐开启，增强安全性)
if (process.contextIsolated) {
  try {
    // 将 electron 工具 API 暴露给渲染进程，通过 window.electron 访问
    contextBridge.exposeInMainWorld('electron', electronAPI)
    // 将自定义 API 暴露给渲染进程，通过 window.api 访问
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('预加载脚本暴露 API 失败:', error)
  }
} else {
  // 如果上下文隔离未开启(不推荐)，直接挂载到 window 对象
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
