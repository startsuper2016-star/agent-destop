import { useState, useEffect } from 'react'
import { KeyRound, Monitor, Check, AlertCircle, Loader2 } from 'lucide-react'
import { StatusDot } from '../ui/StatusDot'
import { KeyTestResult } from '../../types/skill'
import { useEnv } from '../../hooks/useEnv'

interface SettingsPanelProps {
  apiKey: string
  onApiKeyChange: (key: string) => void
}

export function SettingsPanel({ apiKey, onApiKeyChange }: SettingsPanelProps) {
  const [keyTestResult, setKeyTestResult] = useState<KeyTestResult>({
    status: apiKey ? 'pending' : 'unconfigured'
  })
  const [isTesting, setIsTesting] = useState(false)
  const { env, loading } = useEnv()

  useEffect(() => {
    if (apiKey) {
      setKeyTestResult({ status: 'pending' })
    } else {
      setKeyTestResult({ status: 'unconfigured' })
    }
  }, [apiKey])

  const handleTestKey = async () => {
    if (!apiKey) return

    setIsTesting(true)
    setKeyTestResult({ status: 'pending' })

    try {
      const result = await window.api.apiKeyTest({ apiKey })
      if (result.success) {
        setKeyTestResult({ status: 'ready', message: result.message })
      } else {
        setKeyTestResult({ status: 'error', message: result.error })
      }
    } catch (error: any) {
      setKeyTestResult({ status: 'error', message: error.message })
    } finally {
      setIsTesting(false)
    }
  }

  const getStatusMessage = () => {
    switch (keyTestResult.status) {
      case 'unconfigured':
        return 'Not configured'
      case 'pending':
        return 'Click verify to test connection'
      case 'ready':
        return keyTestResult.message || 'Connected'
      case 'error':
        return keyTestResult.message || 'Connection failed'
    }
  }

  return (
    <div className="h-full flex">
      {/* Left Sub-nav */}
      <div className="w-52 border-r border-[var(--border)] bg-[var(--bg-sidebar)]">
        <div className="p-5 border-b border-[var(--border-light)]">
          <h2 className="font-bold text-sm text-[var(--text)]">Settings</h2>
        </div>
        <nav className="p-3">
          <button className="sidebar-link sidebar-link-active w-full justify-start">
            <KeyRound size={16} strokeWidth={2} />
            <span>API Tokens</span>
          </button>
          <button className="sidebar-link w-full justify-start">
            <Monitor size={16} strokeWidth={2} />
            <span>System</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <span className="breadcrumb-current">API Tokens</span>
          </div>
        </div>

        {/* Content */}
        <div className="app-content">
          <div className="max-w-xl">
            {/* API Key Section */}
            <div className="mb-10">
              <h3 className="text-base font-bold text-[var(--text)] mb-1">Gemini API Key</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-5">
                Configure your Gemini API key for AI skill generation.
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder="Enter your Gemini API Key"
                    className="input flex-1"
                  />
                  <button
                    onClick={handleTestKey}
                    disabled={!apiKey || isTesting}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    {isTesting ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                  </button>
                </div>

                <div className="flex items-center gap-2.5 text-sm">
                  <StatusDot status={keyTestResult.status} />
                  <span
                    className={
                      keyTestResult.status === 'ready'
                        ? 'text-green-600 font-medium'
                        : keyTestResult.status === 'error'
                          ? 'text-red-500 font-medium'
                          : 'text-[var(--text-muted)]'
                    }
                  >
                    {getStatusMessage()}
                  </span>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div>
              <h3 className="text-base font-bold text-[var(--text)] mb-1">System Information</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-5">
                Environment and workspace details.
              </p>

              {loading ? (
                <div className="text-sm text-[var(--text-muted)]">Loading...</div>
              ) : (
                <div className="card p-5 space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Operating System</span>
                    <span className="font-semibold text-[var(--text)]">{env?.os || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Skills Directory</span>
                    <span className="font-medium text-xs text-[var(--text)] truncate max-w-[200px]" title={env?.skillsDir}>
                      {env?.skillsDir || 'Not configured'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Directory Status</span>
                    <span className="flex items-center gap-1.5">
                      {env?.skillsDirExists ? (
                        <>
                          <Check size={14} className="text-green-500" strokeWidth={2.5} />
                          <span className="text-green-600 text-xs font-semibold">Created</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} className="text-amber-500" strokeWidth={2.5} />
                          <span className="text-amber-600 text-xs font-semibold">Not created</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
