import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, Monitor, Check, AlertCircle, Loader2, ChevronRight } from 'lucide-react'
import { StatusDot } from '../ui/StatusDot'
import { KeyTestResult } from '../../types/skill'
import { useEnv } from '../../hooks/useEnv'

interface SettingsPanelProps {
  apiKey: string
  onApiKeyChange: (key: string) => void
}

const navItems = [
  { id: 'tokens', icon: KeyRound, label: 'API Tokens' },
  { id: 'system', icon: Monitor, label: 'System' }
]

export function SettingsPanel({ apiKey, onApiKeyChange }: SettingsPanelProps) {
  const [keyTestResult, setKeyTestResult] = useState<KeyTestResult>({
    status: apiKey ? 'pending' : 'unconfigured'
  })
  const [isTesting, setIsTesting] = useState(false)
  const [activeNav, setActiveNav] = useState('tokens')
  const { env, loading } = useEnv()

  useEffect(() => {
    setKeyTestResult({ status: apiKey ? 'pending' : 'unconfigured' })
  }, [apiKey])

  const handleTestKey = useCallback(async () => {
    if (!apiKey) return

    setIsTesting(true)
    setKeyTestResult({ status: 'pending' })

    try {
      const result = await window.api.apiKeyTest({ apiKey })
      setKeyTestResult({
        status: result.success ? 'ready' : 'error',
        message: result.success ? result.message : result.error
      })
    } catch (error: any) {
      setKeyTestResult({ status: 'error', message: error.message })
    } finally {
      setIsTesting(false)
    }
  }, [apiKey])

  const getStatusMessage = useCallback(() => {
    switch (keyTestResult.status) {
      case 'unconfigured':
        return 'Not configured'
      case 'pending':
        return 'Click verify to test connection'
      case 'ready':
        return keyTestResult.message || 'Connected successfully'
      case 'error':
        return keyTestResult.message || 'Connection failed'
    }
  }, [keyTestResult])

  const statusColorClass = keyTestResult.status === 'ready'
    ? 'text-green-600'
    : keyTestResult.status === 'error'
      ? 'text-red-500'
      : 'text-[var(--text-muted)]'

  return (
    <div className="h-full flex">
      {/* Left Sub-nav */}
      <div className="app-subnav">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text)]">Settings</h2>
        </div>
        <nav className="mt-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                activeNav === item.id
                  ? 'bg-[var(--bg-hover)] text-[var(--text)] font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <item.icon size={16} strokeWidth={2} />
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronRight size={14} />
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Content */}
        <div className="app-content">
          {/* Section Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[var(--text)]">{activeNav === 'tokens' ? 'API Tokens' : 'System'}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {activeNav === 'tokens' 
                ? 'Personal access tokens allow the CLI and external integrations to authenticate with your account.'
                : 'Environment and workspace details.'
              }
            </p>
          </div>

          {/* API Key Section */}
          {activeNav === 'tokens' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-blue-50 flex items-center justify-center">
                  <KeyRound size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text)]">Gemini API Key</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Configure your Gemini API key for AI skill generation.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  placeholder="Enter your Gemini API Key"
                  className="flex-1 px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-md)] text-sm text-[var(--text)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
                <button
                  onClick={handleTestKey}
                  disabled={!apiKey || isTesting}
                  className="px-4 py-2.5 bg-[var(--accent-primary)] text-white text-sm font-medium rounded-[var(--radius-md)] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isTesting ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                </button>
              </div>

              <div className="flex items-center gap-2.5 mt-4">
                <StatusDot status={keyTestResult.status} />
                <span className={`text-sm ${statusColorClass}`}>{getStatusMessage()}</span>
              </div>
            </motion.div>
          )}

          {/* System Info */}
          {activeNav === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gray-50 flex items-center justify-center">
                  <Monitor size={20} className="text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text)]">System Information</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Environment and workspace details.</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center py-8 text-sm text-[var(--text-muted)]"
                  >
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Loading...
                  </motion.div>
                ) : (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-base)] rounded-[var(--radius-md)]">
                      <span className="text-sm text-[var(--text-secondary)]">Operating System</span>
                      <span className="text-sm font-medium text-[var(--text)]">{env?.os || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-base)] rounded-[var(--radius-md)]">
                      <span className="text-sm text-[var(--text-secondary)]">Skills Directory</span>
                      <span className="text-sm font-mono text-[var(--text)] truncate max-w-xs" title={env?.skillsDir}>
                        {env?.skillsDir || 'Not configured'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-base)] rounded-[var(--radius-md)]">
                      <span className="text-sm text-[var(--text-secondary)]">Directory Status</span>
                      <span className="flex items-center gap-2">
                        {env?.skillsDirExists ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <Check size={14} strokeWidth={2.5} />
                            <span className="text-sm font-medium">Created</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertCircle size={14} strokeWidth={2.5} />
                            <span className="text-sm font-medium">Not created</span>
                          </span>
                        )}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
