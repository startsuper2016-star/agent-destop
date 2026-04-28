import { ipcMain } from 'electron'
import { saveSkill, listSkills, deleteSkill, readSkill } from '../services/skillStorage'
import { generateSkillContent } from '../services/gemini'

/**
 * 注册技能相关 IPC 处理器
 */
export function registerSkillHandlers(): void {
  // 保存技能
  ipcMain.handle('skill:save', async (_event, { name, content }: { name: string; content: string }) => {
    const result = saveSkill(name, content)
    if (result.success) {
      return { success: true, path: result.path }
    }
    return { error: result.error, status: 400 }
  })

  // 获取技能列表
  ipcMain.handle('skill:list', async () => {
    const result = listSkills()
    if (result.error) {
      return { skills: [], error: result.error }
    }
    return { skills: result.skills }
  })

  // 删除技能
  ipcMain.handle('skill:delete', async (_event, { name }: { name: string }) => {
    const result = deleteSkill(name)
    if (result.success) {
      return { success: true }
    }
    return { error: result.error, status: 404 }
  })

  // 读取技能内容
  ipcMain.handle('skill:read', async (_event, { name }: { name: string }) => {
    const result = readSkill(name)
    if (result.success) {
      return { success: true, content: result.content }
    }
    return { error: result.error, status: 404 }
  })

  // AI 生成技能内容
  ipcMain.handle('skill:generate', async (_event, { prompt, apiKey }: { prompt: string; apiKey: string }) => {
    const result = await generateSkillContent(prompt, apiKey)
    if (result.error) {
      return { error: result.error, status: 500 }
    }
    return { content: result.content }
  })
}
