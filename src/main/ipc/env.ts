import { ipcMain } from 'electron'
import * as os from 'os'
import { existsSync } from 'fs'
import { getSkillsDir } from '../utils/paths'

/**
 * 注册环境相关 IPC 处理器
 */
export function registerEnvHandlers(): void {
  ipcMain.handle('env:check', async () => {
    const skillsDir = getSkillsDir()
    const exists = existsSync(skillsDir)
    return {
      os: os.platform(),
      isCliInstalled: exists,
      skillsDirExists: exists,
      skillsDir
    }
  })
}
