import { Sparkles, FileEdit, ArrowRight } from 'lucide-react'
import { AppStep } from '../../types/skill'

interface HomeProps {
  onNavigate: (step: AppStep) => void
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="app-content">
        <div className="home-container">
          {/* Title Section */}
          <div className="home-header">
            <h1 className="home-title">Create a new skill</h1>
            <p className="home-subtitle">Choose how you want to create your skill.</p>
          </div>

          {/* Options Grid */}
          <div className="home-grid">
            {/* AI Create */}
            <button
              onClick={() => onNavigate('ai')}
              className="home-option"
            >
              <div className="home-option-icon">
                <Sparkles size={28} strokeWidth={1.5} />
              </div>
              <div className="home-option-content">
                <div className="home-option-title">AI Generate</div>
                <div className="home-option-desc">
                  Describe what you need, AI generates the skill for you.
                </div>
              </div>
              <ArrowRight size={18} className="home-option-arrow" />
            </button>

            {/* Manual Create */}
            <button
              onClick={() => onNavigate('editor')}
              className="home-option"
            >
              <div className="home-option-icon home-option-icon-secondary">
                <FileEdit size={28} strokeWidth={1.5} />
              </div>
              <div className="home-option-content">
                <div className="home-option-title">Create manually</div>
                <div className="home-option-desc">
                  Write a new SKILL.md from scratch.
                </div>
              </div>
              <ArrowRight size={18} className="home-option-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
