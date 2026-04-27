import { IpcRendererEvent } from 'electron'
import { ElectronAPI } from '@electron-toolkit/preload'

/**
 * TypeScript 类型声明文件
 * 作用：为 window 对象上挂载的 API 提供类型支持
 * 配合预加载脚本使用，让渲染进程代码能获得完整的类型提示和检查
 */

declare global {
  interface Window {
    // Electron 工具库暴露的 API(包含 ipcRenderer 等)
    electron: ElectronAPI
    // 自定义 API(与 preload/index.ts 中定义的 api 对象对应)
    api: {
      // ping 方法：向主进程发送消息，返回 Promise
      ping: () => Promise<void>
    }
  }
}
