import * as os from 'os'
import * as path from 'path'

/**
 * 技能保存目录配置
 */
const SKILLS_DIR_NAME = '.zhike'
const SKILLS_SUBDIR = 'skills'

/**
 * 获取代理 URL
 * 优先级: HTTPS_PROXY > HTTP_PROXY > ALL_PROXY (支持大小写)
 */
export function getProxyUrl(): string | undefined {
  return (
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.ALL_PROXY ||
    process.env.https_proxy ||
    process.env.http_proxy ||
    process.env.all_proxy
  )
}

/**
 * 获取技能保存目录路径
 */
export function getSkillsDir(): string {
  return path.join(os.homedir(), SKILLS_DIR_NAME, SKILLS_SUBDIR)
}

/**
 * 安全处理技能名称，防止路径遍历攻击
 */
export function sanitizeSkillName(name: string): string {
  return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()
}
