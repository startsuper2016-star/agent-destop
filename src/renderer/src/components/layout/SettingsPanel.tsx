import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, Monitor, Check, AlertCircle, Loader2 } from 'lucide-react'
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

const contentVariants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0 }
}

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
      : 'text-[var(--text-secondary)]'

  return (
    <div className="settings-page">
      {/* Navigation */}
      <nav className="settings-nav">
        <div className="settings-nav-header">
          <h1 className="settings-nav-title">设置</h1>
        </div>
        <div className="settings-nav-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`settings-nav-item ${activeNav === item.id ? 'settings-nav-item-active' : ''}`}
            >
              <div className="settings-nav-item-icon">
                <item.icon size={18} strokeWidth={2} />
              </div>
              <span className="settings-nav-item-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="settings-main">
        <AnimatePresence mode="wait">
          {activeNav === 'tokens' && (
            <motion.section
              key="tokens"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.3 }}
              className="settings-section"
            >
              <div className="settings-section-header">
                <h2 className="settings-section-title">API Tokens</h2>
                <p className="settings-section-desc">
                  Personal access tokens allow the CLI and external integrations to authenticate with your account.
                </p>
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon settings-card-icon-api">
                    <KeyRound size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="settings-card-title">Gemini API Key</h3>
                    <p className="settings-card-subtitle">Configure your Gemini API key for AI skill generation.</p>
                  </div>
                </div>

                <div className="settings-card-body">
                  <div className="settings-input-group">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => onApiKeyChange(e.target.value)}
                      placeholder="Enter your Gemini API Key"
                      className="settings-input"
                    />
                    <button
                      onClick={handleTestKey}
                      disabled={!apiKey || isTesting}
                      className="btn btn-primary"
                    >
                      {isTesting ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                    </button>
                  </div>

                  <div className="settings-status">
                    <StatusDot status={keyTestResult.status} />
                    <span className={`settings-status-text ${statusColorClass}`}>
                      {getStatusMessage()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {activeNav === 'system' && (
            <motion.section
              key="system"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.3 }}
              className="settings-section"
            >
              <div className="settings-section-header">
                <h2 className="settings-section-title">System</h2>
                <p className="settings-section-desc">
                  Environment and workspace details for your application.
                </p>
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon settings-card-icon-system">
                    <Monitor size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="settings-card-title">System Information</h3>
                    <p className="settings-card-subtitle">Current environment configuration.</p>
                  </div>
                </div>

                <div className="settings-card-body">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center py-8"
                      >
                        <Loader2 size={20} className="animate-spin text-[var(--text-muted)]" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="info"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="settings-info-list"
                      >
                        <div className="settings-info-row">
                          <span className="settings-info-label">Operating System</span>
                          <span className="settings-info-value">{env?.os || 'Unknown'}</span>
                        </div>
                        <div className="settings-info-row">
                          <span className="settings-info-label">Skills Directory</span>
                          <span className="settings-info-value" title={env?.skillsDir}>
                            {env?.skillsDir || 'Not configured'}
                          </span>
                        </div>
                        <div className="settings-info-row">
                          <span className="settings-info-label">Directory Status</span>
                          <span className="flex items-center gap-2">
                            {env?.skillsDirExists ? (
                              <span className="flex items-center gap-1.5 text-green-600">
                                <Check size={14} strokeWidth={2.5} />
                                <span className="settings-info-value">Created</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-amber-600">
                                <AlertCircle size={14} strokeWidth={2.5} />
                                <span className="settings-info-value">Not created</span>
                              </span>
                            )}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}