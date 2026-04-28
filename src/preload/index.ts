import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

/**
 * 预加载脚本(Preload Script)
 * 作用：在渲染进程和主进程之间建立安全的桥梁
 */

// 环境信息类型
interface EnvInfo {
  os: string
  isCliInstalled: boolean
  skillsDirExists: boolean
  skillsDir: string
}

// 技能数据类型
interface SkillData {
  name: string
  content: string
}

// 技能列表项
interface SkillItem {
  name: string
  path: string
  size: number
  modified: string
}

// API 响应类型
interface ApiResponse {
  error?: string
  status?: number
  [key: string]: any
}

// 自定义 API 对象
const api = {
  // 环境检测
  envCheck: (): Promise<EnvInfo> => ipcRenderer.invoke('env:check'),

  // 保存技能
  skillSave: (data: SkillData): Promise<ApiResponse> =>
    ipcRenderer.invoke('skill:save', data),

  // AI 生成技能
  skillGenerate: (data: { prompt: string; apiKey: string }): Promise<ApiResponse> =>
    ipcRenderer.invoke('skill:generate', data),

  // 测试 API Key
  apiKeyTest: (data: { apiKey: string }): Promise<ApiResponse> =>
    ipcRenderer.invoke('apiKey:test', data),

  // 获取技能列表
  skillList: (): Promise<{ skills: SkillItem[]; error?: string }> =>
    ipcRenderer.invoke('skill:list'),

  // 删除技能
  skillDelete: (data: { name: string }): Promise<ApiResponse> =>
    ipcRenderer.invoke('skill:delete', data),

  // 读取技能内容
  skillRead: (data: { name: string }): Promise<ApiResponse> =>
    ipcRenderer.invoke('skill:read', data)
}

// 检查是否启用了上下文隔离
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('预加载脚本暴露 API 失败:', error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
