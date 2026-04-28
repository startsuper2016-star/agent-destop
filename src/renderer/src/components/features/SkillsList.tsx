import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Plus, FileText, ChevronRight } from 'lucide-react'

interface SkillItem {
  name: string
  path: string
  size: number
  modified: string
}

interface SkillsListProps {
  onCreateSkill: () => void
}

export function SkillsList({ onCreateSkill }: SkillsListProps) {
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      const result = await window.api.skillList()
      if (result.skills) {
        setSkills(result.skills)
      }
    } catch (error) {
      console.error('Failed to load skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <span className="breadcrumb-item">All skills</span>
            <ChevronRight size={16} className="breadcrumb-separator" />
            <span className="breadcrumb-current">Skills</span>
          </div>
          <button onClick={onCreateSkill} className="btn btn-primary btn-sm">
            <Plus size={14} />
            New skill
          </button>
        </div>

        {/* Content */}
        <div className="app-content p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-[var(--text-muted)] text-sm">
              Loading...
            </div>
          ) : skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)]">
              <FolderOpen size={36} className="mb-4 opacity-30" />
              <p className="text-sm font-medium">No skills yet</p>
              <button onClick={onCreateSkill} className="btn btn-secondary btn-sm mt-4">
                <Plus size={14} />
                Create your first skill
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-light)]">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="list-item"
                >
                  <FileText size={18} className="text-[var(--text-muted)] shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text)] truncate">{skill.name}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      {formatDate(skill.modified)} · {formatSize(skill.size)}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-muted)]" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
