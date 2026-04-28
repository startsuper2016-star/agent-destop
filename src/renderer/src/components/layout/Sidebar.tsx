import { Plus, FolderOpen, Settings, Search } from 'lucide-react'
import { AppStep } from '../../types/skill'

interface SidebarProps {
  step: AppStep
  onStepChange: (step: AppStep) => void
  onSettingsOpen: () => void
}

export function Sidebar({ step, onStepChange, onSettingsOpen }: SidebarProps) {
  const isActive = (id: AppStep) => step === id

  const quickNav = [
    { id: 'home' as AppStep, icon: Plus, label: 'New skill' }
  ]

  const workspaceNav = [
    { id: 'skills' as AppStep, icon: FolderOpen, label: 'Skills' }
  ]

  const configureNav = [
    { id: 'settings' as AppStep, icon: Settings, label: 'Settings' }
  ]

  return (
    <aside className="app-sidebar">
      {/* Workspace selector */}
      <div className="sidebar-header">
        <div className="sidebar-logo">Z</div>
        <span className="sidebar-brand">zhike</span>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <Search size={14} />
        <span>Search...</span>
        <span className="ml-auto text-[11px] opacity-40 font-mono">⌘K</span>
      </div>

      {/* Quick Actions */}
      <div className="px-2">
        {quickNav.map((item) => (
          <button
            key={item.id}
            onClick={() => onStepChange('home')}
            className={`sidebar-link ${isActive(item.id) ? 'sidebar-link-active' : ''}`}
          >
            <item.icon size={16} strokeWidth={2} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Workspace Section */}
      <div className="mt-1">
        <div className="sidebar-section-title">Workspace</div>
        <div className="px-2">
          {workspaceNav.map((item) => (
            <button
              key={item.id}
              onClick={() => onStepChange(item.id)}
              className={`sidebar-link ${isActive(item.id) ? 'sidebar-link-active' : ''}`}
            >
              <item.icon size={16} strokeWidth={2} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Configure Section */}
      <div className="mt-auto pb-4">
        <div className="sidebar-section-title">Configure</div>
        <div className="px-2">
          {configureNav.map((item) => (
            <button
              key={item.id}
              onClick={() => onSettingsOpen()}
              className="sidebar-link"
            >
              <item.icon size={16} strokeWidth={2} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
