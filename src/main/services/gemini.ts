import { getProxyUrl } from '../utils/paths'

const GEMINI_MODEL = 'gemini-2.5-flash-lite'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

/**
 * 调用 Gemini API
 */
export async function fetchGemini(
  apiKey: string,
  prompt: string
): Promise<{ content: string } | { error: string }> {
  const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`
  const proxyUrl = getProxyUrl()

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
  })

  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  }

  try {
    // 尝试使用代理
    if (proxyUrl) {
      console.log('📡 [Backend] Attempting fetch via proxy:', proxyUrl)
      const { ProxyAgent } = await import('undici')
      const response = await fetch(url, {
        ...fetchOptions,
        dispatcher: new ProxyAgent(proxyUrl)
      } as any)
      const data = await response.json()
      if (data.error) {
        return { error: data.error.message }
      }
      return { content: data.candidates[0].content.parts[0].text }
    }
  } catch (proxyError: any) {
    console.log('⚠️ [Backend] Proxy request failed, fallback to direct:', proxyError.message)
  }

  // 直接连接
  console.log('📡 [Backend] Attempting direct fetch (no proxy configured)')
  const response = await fetch(url, fetchOptions)
  const data = await response.json()

  if (data.error) {
    return { error: data.error.message }
  }

  return { content: data.candidates[0].content.parts[0].text }
}

/**
 * 测试 API Key 是否有效
 */
export async function testApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  if (!apiKey) {
    return { success: false, error: '请先输入 API Key' }
  }

  const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello' }] }]
      })
    })

    const data = await response.json()

    if (data.error) {
      return { success: false, error: data.error.message }
    }

    if (data.candidates && data.candidates[0]) {
      return { success: true }
    }

    return { success: false, error: '响应格式不正确' }
  } catch (error: any) {
    console.error('❌ [API ERROR]:', error.message)
    return { success: false, error: `连接失败: ${error.message}` }
  }
}

/**
 * 生成技能内容
 */
export async function generateSkillContent(prompt: string, apiKey: string): Promise<{ content?: string; error?: string }> {
  if (!apiKey) {
    return { error: '请先在设置中配置 API Key' }
  }

  const systemPrompt = `你是一个资深的 Gemini CLI Agent Skill 架构师。
你的任务是根据用户的需求，生成一个符合规范的 SKILL.md 文件内容。

规范要求：
1. 必须包含 YAML Frontmatter (name 和 description)。
2. 必须包含 # Instructions 标题。
3. 指令必须清晰、具体，使用祈使句。
4. 输出必须仅包含 Markdown 内容。

用户需求：${prompt}`

  const result = await fetchGemini(apiKey, systemPrompt)
  if ('error' in result) {
    return { error: `AI 生成失败: ${result.error}` }
  }
  return { content: result.content }
}
