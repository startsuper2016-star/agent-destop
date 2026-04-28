/**
 * SKILL.md 解析工具
 * 解析 YAML Frontmatter 和 Instructions 内容
 */

import { SkillContent } from '../types/skill'

// Hoist RegExp to module level for better performance
const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n/
const NAME_REGEX = /name:\s*(.+)/
const DESC_REGEX = /description:\s*(.+)/
const INSTRUCTIONS_REGEX = /^#\s*Instructions\s*\n([\s\S]*)/

/**
 * 解析 SKILL.md 内容
 */
export function parseSkillMarkdown(content: string): SkillContent {
  const defaultResult: SkillContent = {
    name: '',
    description: '',
    instructions: '',
    fullContent: content
  }

  // 提取 YAML Frontmatter
  const frontmatterMatch = content.match(FRONTMATTER_REGEX)
  if (!frontmatterMatch) {
    return defaultResult
  }

  const frontmatter = frontmatterMatch[1]
  const remainingContent = content.slice(frontmatterMatch[0].length)

  // 解析 YAML 字段
  const nameMatch = frontmatter.match(NAME_REGEX)
  const descMatch = frontmatter.match(DESC_REGEX)

  // 提取 Instructions 部分
  const instructionsMatch = remainingContent.match(INSTRUCTIONS_REGEX)
  const instructions = instructionsMatch ? instructionsMatch[1].trim() : remainingContent.trim()

  return {
    name: nameMatch ? nameMatch[1].trim() : '',
    description: descMatch ? descMatch[1].trim() : '',
    instructions,
    fullContent: content
  }
}

/**
 * 生成 SKILL.md 内容
 */
export function generateSkillMarkdown(data: Partial<SkillContent>): string {
  const name = data.name || 'unnamed-skill'
  const description = data.description || 'No description provided'
  const instructions = data.instructions || 'No instructions provided'

  return `---
name: ${name}
description: ${description}
---

# Instructions

${instructions}
`
}

/**
 * 清理技能名称（用于文件名）
 */
export function sanitizeSkillName(name: string): string {
  return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()
}
