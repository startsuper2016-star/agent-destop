import { ElectronAPI } from '@electron-toolkit/preload'

/**
 * TypeScript 类型声明文件
 * 为 window 对象上挂载的 API 提供类型支持
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
interface ApiResponse<T = {}> {
  error?: string
  status?: number
  [key: string]: any
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // 环境检测
      envCheck: () => Promise<EnvInfo>

      // 保存技能
      skillSave: (data: SkillData) => Promise<ApiResponse<{ success: boolean; path: string }>>

      // AI 生成技能
      skillGenerate: (data: { prompt: string; apiKey: string }) => Promise<ApiResponse<{ content: string }>>

      // 测试 API Key
      apiKeyTest: (data: { apiKey: string }) => Promise<ApiResponse<{ success: boolean; message?: string }>>

      // 获取技能列表
      skillList: () => Promise<{ skills: SkillItem[]; error?: string }>

      // 删除技能
      skillDelete: (data: { name: string }) => Promise<ApiResponse<{ success: boolean }>>

      // 读取技能内容
      skillRead: (data: { name: string }) => Promise<ApiResponse<{ success: boolean; content: string }>>
    }
  }
}

export { EnvInfo, SkillData, ApiResponse, SkillItem }