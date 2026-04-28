import { ipcMain } from 'electron'
import { testApiKey } from '../services/gemini'

/**
 * 注册 API Key 相关 IPC 处理器
 */
export function registerApiKeyHandlers(): void {
  ipcMain.handle('apiKey:test', async (_event, { apiKey }: { apiKey: string }) => {
    const result = await testApiKey(apiKey)
    if (result.success) {
      return { success: true, message: '连接成功！' }
    }
    return { success: false, error: result.error, status: 400 }
  })
}
