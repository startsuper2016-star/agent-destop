import { registerEnvHandlers } from './env'
import { registerSkillHandlers } from './skill'
import { registerApiKeyHandlers } from './apiKey'

/**
 * 注册所有 IPC 处理器
 */
export function registerAllIpcHandlers(): void {
  registerEnvHandlers()
  registerSkillHandlers()
  registerApiKeyHandlers()
}
