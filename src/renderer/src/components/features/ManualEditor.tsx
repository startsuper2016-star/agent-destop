import { useState, useEffect } from 'react'
import { Save, PenLine, ChevronRight } from 'lucide-react'
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

function buildSkillMarkdown(data: FormData): string {
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

export function ManualEditor({ onBack }: ManualEditorProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    instructions: ''
  })
  const [previewContent, setPreviewContent] = useState('')

  useEffect(() => {
    const content = buildSkillMarkdown(formData)
    setPreviewContent(content)
  }, [formData])

  const handleSave = async () => {
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
      setFormData({ name: '', description: '', instructions: '' })
    } else {
      toast.error(result.error || '保存失败')
    }
  }

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <span className="breadcrumb-item" onClick={onBack}>New skill</span>
            <ChevronRight size={16} className="breadcrumb-separator" />
            <span className="breadcrumb-current">Create manually</span>
          </div>
        </div>

        {/* Content */}
        <div className="app-content">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Name Field */}
            <div>
              <label className="form-label">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. review-helper"
                className="input"
              />
              <p className="form-hint">Must be unique within the workspace.</p>
            </div>

            {/* Description Field */}
            <div>
              <label className="form-label">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="One sentence on when to assign this skill to an agent."
                className="input"
              />
            </div>

            {/* Instructions Field */}
            <div>
              <label className="form-label">
                Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Enter the skill instructions..."
                className="textarea min-h-[240px]"
              />
            </div>

            {/* Actions */}
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.instructions}
              className="btn btn-primary w-full justify-center disabled:opacity-50"
            >
              <Save size={16} />
              Create skill
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="app-right-panel p-6">
        <div className="section-title">Preview</div>
        {previewContent ? (
          <CodePane className="max-h-[calc(100vh-120px)]">
            <pre className="whitespace-pre-wrap">{previewContent}</pre>
          </CodePane>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-[var(--text-muted)] gap-3">
            <PenLine size={28} className="opacity-20" />
            <span className="text-sm">Start filling the form to see preview.</span>
          </div>
        )}
      </div>
    </div>
  )
}
