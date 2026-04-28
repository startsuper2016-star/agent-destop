import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Plus, FileText, ChevronRight, Clock, HardDrive } from 'lucide-react'

interface SkillItem {
  name: string
  path: string
  size: number
  modified: string
}

interface SkillsListProps {
  onCreateSkill: () => void
}

// Module-level formatters (pure functions, can be cached)
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Animation variants - hoisted to avoid recreation
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 }
}

export function SkillsList({ onCreateSkill }: SkillsListProps) {
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadSkills = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  // Memoize formatted skills data
  const formattedSkills = useMemo(() => {
    return skills.map(skill => ({
      ...skill,
      formattedDate: formatDate(skill.modified),
      formattedSize: formatSize(skill.size)
    }))
  }, [skills])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="page-header">
        <div className="breadcrumb">
          <span className="breadcrumb-item">Workspace</span>
          <ChevronRight size={16} className="breadcrumb-separator" />
          <span className="breadcrumb-current">Skills</span>
        </div>
        <button onClick={onCreateSkill} className="btn btn-primary btn-sm">
          <Plus size={14} />
          New skill
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-[var(--text-muted)] text-sm">
            Loading...
          </div>
        ) : formattedSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] py-20">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center mb-5">
              <FolderOpen size={28} className="opacity-30" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium mb-1">No skills yet</p>
            <p className="text-xs text-[var(--text-muted)] mb-6">Create your first skill to get started</p>
            <button onClick={onCreateSkill} className="btn btn-secondary btn-sm">
              <Plus size={14} />
              Create your first skill
            </button>
          </div>
        ) : (
          <div>
            {formattedSkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.03, duration: 0.2 }}
                className="list-item group"
              >
                <div className="list-item-icon">
                  <FileText size={18} className="text-[var(--text-muted)]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--text)] truncate">{skill.name}</div>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {skill.formattedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive size={12} />
                      {skill.formattedSize}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
