import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, Save, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { CodePane } from '../ui/CodePane'
import { SkillContent } from '../../types/skill'
import { parseSkillMarkdown } from '../../lib/skillParser'

interface AICreatorProps {
  apiKey: string
  onBack: () => void
}

export function AICreator({ apiKey, onBack }: AICreatorProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [skillData, setSkillData] = useState<SkillContent | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('请输入你的需求描述')
      return
    }

    if (!apiKey) {
      toast.error('请先在设置中配置 API Key')
      return
    }

    setIsLoading(true)
    setGeneratedContent('')
    setSkillData(null)

    try {
      const result = await window.api.skillGenerate({ prompt, apiKey })

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.content) {
        setGeneratedContent(result.content)
        const parsed = parseSkillMarkdown(result.content)
        setSkillData(parsed)
        toast.success('技能生成成功')
      }
    } catch (error: any) {
      toast.error(`生成失败: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [prompt, apiKey])

  const handleSave = useCallback(async () => {
    if (!skillData?.name) {
      toast.error('技能名称不能为空')
      return
    }

    const result = await window.api.skillSave({
      name: skillData.name,
      content: generatedContent
    })

    if (result.success) {
      toast.success(`已保存到: ${result.path}`)
    } else {
      toast.error(result.error || '保存失败')
    }
  }, [skillData, generatedContent])

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content */}
        <div className="app-content">
          <div className="content-centered-lg">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
              <button onClick={onBack} className="hover:text-[var(--accent-primary)] transition-colors">New skill</button>
              <ChevronRight size={14} />
              <span className="text-[var(--text-secondary)]">AI Generate</span>
            </div>

            {/* Prompt Input */}
            <div className="mb-8">
              <label className="form-label">Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want the skill to do..."
                className="textarea min-h-[140px]"
                disabled={isLoading}
              />
              <p className="form-hint">
                One sentence describing when an agent should use this skill...
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="btn btn-primary w-full justify-center disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate skill
                </>
              )}
            </button>

            {/* Generated Content */}
            <AnimatePresence>
              {generatedContent && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  className="mt-10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <label className="form-label mb-0">Generated SKILL.md</label>
                    <button onClick={handleSave} className="btn btn-secondary btn-sm">
                      <Save size={14} />
                      Save skill
                    </button>
                  </div>
                  <CodePane className="max-h-[420px]">
                    <pre className="whitespace-pre-wrap">{generatedContent}</pre>
                  </CodePane>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Panel - Metadata */}
      <AnimatePresence>
        {skillData && (
          <motion.div
            className="app-right-panel p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="section-title">Metadata</div>
            <div className="space-y-6 text-sm">
              <div>
                <div className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider mb-2">Name</div>
                <div className="font-semibold text-[var(--text)] text-base">{skillData.name}</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider mb-2">Description</div>
                <div className="text-[var(--text-secondary)] leading-relaxed">{skillData.description}</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider mb-2">Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium text-green-600">Generated</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
