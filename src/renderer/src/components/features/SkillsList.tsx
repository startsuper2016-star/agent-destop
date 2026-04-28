import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Plus, FileText, Clock, HardDrive, Search, ArrowRight, Sparkles, Grid, List, SlidersHorizontal } from 'lucide-react'

interface SkillItem {
  name: string
  path: string
  size: number
  modified: string
}

interface SkillsListProps {
  onCreateSkill: () => void
}

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

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 }
}

export function SkillsList({ onCreateSkill }: SkillsListProps) {
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

  const formattedSkills = useMemo(() => {
    return skills.map(skill => ({
      ...skill,
      formattedDate: formatDate(skill.modified),
      formattedSize: formatSize(skill.size)
    }))
  }, [skills])

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return formattedSkills
    const query = searchQuery.toLowerCase()
    return formattedSkills.filter(skill =>
      skill.name.toLowerCase().includes(query)
    )
  }, [formattedSkills, searchQuery])

  const totalSize = useMemo(() => {
    return formattedSkills.reduce((acc, skill) => acc + skill.size, 0)
  }, [formattedSkills])

  return (
    <div className="skills-page">
      {/* Header */}
      <div className="skills-header">
        <div className="skills-header-inner">
          {/* Top Row: Title + Actions */}
          <div className="skills-header-top">
            <div className="skills-title-section">
              <div className="skills-title-badge">
                <Sparkles size={14} />
              </div>
              <div>
                <h1 className="skills-title">Skills</h1>
                <p className="skills-subtitle">
                  {loading ? 'Loading...' : 'Manage your AI-powered skill workflows'}
                </p>
              </div>
            </div>

            <button onClick={onCreateSkill} className="skills-create-btn">
              <Plus size={16} />
              <span>New Skill</span>
            </button>
          </div>

          {/* Bottom Row: Stats + Search + View Toggle */}
          <div className="skills-header-bottom">
            <div className="skills-stats">
              <div className="skills-stat">
                <span className="skills-stat-value">{formattedSkills.length}</span>
                <span className="skills-stat-label">Total</span>
              </div>
              <div className="skills-stat-divider" />
              <div className="skills-stat">
                <span className="skills-stat-value">{formatSize(totalSize)}</span>
                <span className="skills-stat-label">Size</span>
              </div>
            </div>

            <div className="skills-toolbar">
              <div className="skills-search-wrapper">
                <Search size={15} className="skills-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills..."
                  className="skills-search"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="skills-search-clear"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="skills-view-toggle">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`skills-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  title="Grid view"
                >
                  <Grid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`skills-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  title="List view"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="skills-content">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="skills-empty"
            >
              <div className="skills-empty-icon">
                <FileText size={36} strokeWidth={1.5} />
              </div>
              <p className="skills-empty-title">Loading skills...</p>
            </motion.div>
          ) : filteredSkills.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="skills-empty"
            >
              <div className="skills-empty-icon">
                {searchQuery ? <Search size={36} strokeWidth={1.5} /> : <FolderOpen size={36} strokeWidth={1.5} />}
              </div>
              <p className="skills-empty-title">
                {searchQuery ? 'No matching skills' : 'No skills yet'}
              </p>
              <p className="skills-empty-desc">
                {searchQuery
                  ? 'Try a different search term or clear the search.'
                  : 'Create your first skill to get started with AI-powered workflows.'
                }
              </p>
              {!searchQuery && (
                <button onClick={onCreateSkill} className="btn btn-primary">
                  <Plus size={16} />
                  Create First Skill
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={viewMode === 'grid' ? 'skills-grid' : 'skills-list'}
            >
              {filteredSkills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{
                    delay: index * 0.04,
                    duration: 0.35,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className={viewMode === 'grid' ? 'skill-card' : 'skill-list-item'}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="skill-card-header">
                        <div className="skill-card-icon">
                          <FileText size={20} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="skill-card-title">{skill.name}</div>
                          <div className="skill-card-meta">
                            <span className="skill-card-meta-item">
                              <Clock size={12} />
                              {skill.formattedDate}
                            </span>
                            <span className="skill-card-meta-item">
                              <HardDrive size={12} />
                              {skill.formattedSize}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="skill-card-arrow">
                        <ArrowRight size={16} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="skill-list-icon">
                        <FileText size={18} strokeWidth={1.5} />
                      </div>
                      <div className="skill-list-content">
                        <div className="skill-list-title">{skill.name}</div>
                        <div className="skill-list-meta">
                          <span className="skill-list-meta-item">
                            <Clock size={12} />
                            {skill.formattedDate}
                          </span>
                          <span className="skill-list-meta-item">
                            <HardDrive size={12} />
                            {skill.formattedSize}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="skill-list-arrow" />
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}