import { Sparkles, FileEdit } from 'lucide-react'
import { AppStep } from '../../types/skill'

interface HomeProps {
  onNavigate: (step: AppStep) => void
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="page-header">
        <div className="breadcrumb">
          <span className="breadcrumb-current">New skill</span>
        </div>
      </div>

      {/* Content */}
      <div className="app-content">
        <div className="max-w-lg mx-auto mt-16">
          <div className="mb-10">
            <h1 className="page-title">Create a new skill</h1>
            <p className="page-subtitle">
              Choose how you want to create your skill.
            </p>
          </div>

          <div className="space-y-4">
            {/* AI Create */}
            <button
              onClick={() => onNavigate('ai')}
              className="card-option"
            >
              <div className="card-option-icon">
                <Sparkles size={18} strokeWidth={1.5} />
              </div>
              <div>
                <div className="card-option-title">AI Generate</div>
                <div className="card-option-desc">
                  Describe what you need, AI generates the skill for you.
                </div>
              </div>
            </button>

            {/* Manual Create */}
            <button
              onClick={() => onNavigate('editor')}
              className="card-option"
            >
              <div className="card-option-icon">
                <FileEdit size={18} strokeWidth={1.5} />
              </div>
              <div>
                <div className="card-option-title">Create manually</div>
                <div className="card-option-desc">
                  Write a new SKILL.md from scratch.
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
