/**
 * 技能相关类型定义
 */

// 技能内容结构
export interface SkillContent {
  name: string
  description: string
  instructions: string
  fullContent: string
}

// 环境信息
export interface EnvInfo {
  os: string
  isCliInstalled: boolean
  skillsDirExists: boolean
  skillsDir: string
}

// API Key 测试结果
export interface KeyTestResult {
  status: 'unconfigured' | 'pending' | 'ready' | 'error'
  message?: string
}

// 页面步骤
export type AppStep = 'home' | 'skills' | 'ai' | 'editor' | 'settings'

// 保存结果
export interface SaveResult {
  success: boolean
  path?: string
  error?: string
}
