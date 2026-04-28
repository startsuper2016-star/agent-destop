import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, ChevronRight, FileCode } from 'lucide-react'
import { toast } from 'sonner'
import { CodePane } from '../ui/CodePane'

interface ManualEditorProps {
  onBack: () => void
}

interface FormData {
  name: string
  description: string
  instructions: string
}

// Build skill markdown - pure function, can be hoisted
const buildSkillMarkdown = (data: FormData): string => {
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

// Initial form state - hoisted to avoid recreation
const INITIAL_FORM_DATA: FormData = {
  name: '',
  description: '',
  instructions: ''
}

// Animation variants
const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
}

export function ManualEditor({ onBack }: ManualEditorProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)

  // Derive preview content from form data (no useEffect needed)
  const previewContent = useMemo(() => buildSkillMarkdown(formData), [formData])

  // Derive form validity
  const isFormValid = formData.name && formData.instructions

  // Stable update handlers
  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    if (!formData.name || !formData.instructions) {
      toast.error('请填写所有必填字段')
      return
    }

    const content = buildSkillMarkdown(formData)
    const result = await window.api.skillSave({
      name: formData.name,
      content
    })

    if (result.success) {
      toast.success(`已保存到: ${result.path}`)
      setFormData(INITIAL_FORM_DATA)
    } else {
      toast.error(result.error || '保存失败')
    }
  }, [formData])

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content */}
        <div className="app-content">
          <div className="max-w-xl space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <button onClick={onBack} className="hover:text-[var(--accent-primary)] transition-colors">New skill</button>
              <ChevronRight size={14} />
              <span className="text-[var(--text-secondary)]">Create manually</span>
            </div>

            {/* Name Field */}
            <motion.div
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.2 }}
            >
              <label className="form-label">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. review-helper"
                className="input"
              />
              <p className="form-hint">Must be unique within the workspace.</p>
            </motion.div>

            {/* Description Field */}
            <motion.div
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <label className="form-label">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="One sentence on when to assign this skill to an agent."
                className="input"
              />
            </motion.div>

            {/* Instructions Field */}
            <motion.div
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <label className="form-label">
                Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => updateField('instructions', e.target.value)}
                placeholder="Enter the skill instructions..."
                className="textarea min-h-[280px]"
              />
            </motion.div>

            {/* Actions */}
            <motion.button
              onClick={handleSave}
              disabled={!isFormValid}
              className="btn btn-primary w-full justify-center disabled:opacity-50"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.2, delay: 0.15 }}
            >
              <Save size={16} />
              Create skill
            </motion.button>
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <motion.div
        className="app-right-panel p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="section-title">Preview</div>
        <AnimatePresence mode="wait">
          {previewContent ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CodePane className="max-h-[calc(100vh-140px)]">
                <pre className="whitespace-pre-wrap">{previewContent}</pre>
              </CodePane>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)]"
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] flex items-center justify-center mb-4">
                <FileCode size={24} className="opacity-30" strokeWidth={1.5} />
              </div>
              <span className="text-sm">Start filling the form to see preview</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
