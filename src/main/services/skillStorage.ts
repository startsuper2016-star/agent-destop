import * as fs from 'fs'
import * as path from 'path'
import { getSkillsDir, sanitizeSkillName } from '../utils/paths'

export interface SkillMeta {
  name: string
  path: string
  size: number
  modified: string
}

export interface SkillListResult {
  skills: SkillMeta[]
  error?: string
}

/**
 * 确保技能目录存在
 */
export function ensureSkillsDir(): string {
  const skillsDir = getSkillsDir()
  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true })
  }
  return skillsDir
}

/**
 * 保存技能
 */
export function saveSkill(name: string, content: string): { success: boolean; path?: string; error?: string } {
  if (!name || !content) {
    return { success: false, error: '技能名称和内容不能为空' }
  }

  const safeName = sanitizeSkillName(name)
  const skillsDir = getSkillsDir()
  const targetDir = path.join(skillsDir, safeName)
  const filePath = path.join(targetDir, 'SKILL.md')

  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    fs.writeFileSync(filePath, content, 'utf8')
    return { success: true, path: filePath }
  } catch (error: any) {
    console.error('❌ [Save Error]:', error.message)
    return { success: false, error: `保存失败: ${error.message}` }
  }
}

/**
 * 获取技能列表
 */
export function listSkills(): SkillListResult {
  const skillsDir = getSkillsDir()

  if (!fs.existsSync(skillsDir)) {
    return { skills: [] }
  }

  try {
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true })
    const skills = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const skillPath = path.join(skillsDir, entry.name)
        const stats = fs.statSync(skillPath)

        return {
          name: entry.name,
          path: skillPath,
          size: stats.size,
          modified: stats.mtime.toISOString()
        }
      })
      .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())

    return { skills }
  } catch (error: any) {
    console.error('❌ [List Error]:', error.message)
    return { skills: [], error: error.message }
  }
}

/**
 * 删除技能
 */
export function deleteSkill(name: string): { success: boolean; error?: string } {
  if (!name) {
    return { success: false, error: '技能名称不能为空' }
  }

  const safeName = sanitizeSkillName(name)
  const skillsDir = getSkillsDir()
  const targetDir = path.join(skillsDir, safeName)

  if (!fs.existsSync(targetDir)) {
    return { success: false, error: '技能不存在' }
  }

  try {
    fs.rmSync(targetDir, { recursive: true, force: true })
    return { success: true }
  } catch (error: any) {
    console.error('❌ [Delete Error]:', error.message)
    return { success: false, error: `删除失败: ${error.message}` }
  }
}

/**
 * 读取技能内容
 */
export function readSkill(name: string): { success: boolean; content?: string; error?: string } {
  if (!name) {
    return { success: false, error: '技能名称不能为空' }
  }

  const safeName = sanitizeSkillName(name)
  const skillsDir = getSkillsDir()
  const filePath = path.join(skillsDir, safeName, 'SKILL.md')

  if (!fs.existsSync(filePath)) {
    return { success: false, error: '技能不存在' }
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return { success: true, content }
  } catch (error: any) {
    console.error('❌ [Read Error]:', error.message)
    return { success: false, error: `读取失败: ${error.message}` }
  }
}
