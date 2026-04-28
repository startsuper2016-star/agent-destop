import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertCircle, Loader2, KeyRound, Monitor } from 'lucide-react'
import { StatusDot } from '../ui/StatusDot'
import { KeyTestResult } from '../../types/skill'
import { useEnv } from '../../hooks/useEnv'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  apiKey: string
  onApiKeyChange: (key: string) => void
}

export function SettingsModal({ isOpen, onClose, apiKey, onApiKeyChange }: SettingsModalProps) {
  const [keyTestResult, setKeyTestResult] = useState<KeyTestResult>({
    status: apiKey ? 'pending' : 'unconfigured'
  })
  const [isTesting, setIsTesting] = useState(false)
  const { env, loading } = useEnv()

  // 当 apiKey 变化时重置测试状态
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
        return '未配置 API Key'
      case 'pending':
        return '点击验证按钮测试连接'
      case 'ready':
        return keyTestResult.message || '连接成功'
      case 'error':
        return keyTestResult.message || '连接失败'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold">设置</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* API Key 配置 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <KeyRound size={16} className="text-blue-500" />
                  Gemini API Key
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder="输入你的 Gemini API Key"
                    className="apple-input flex-1 text-sm"
                  />
                  <button
                    onClick={handleTestKey}
                    disabled={!apiKey || isTesting}
                    className="apple-button-secondary px-3 disabled:opacity-50 text-sm"
                  >
                    {isTesting ? <Loader2 size={16} className="animate-spin" /> : '验证'}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <StatusDot status={keyTestResult.status} />
                  <span
                    className={
                      keyTestResult.status === 'ready'
                        ? 'text-green-600'
                        : keyTestResult.status === 'error'
                          ? 'text-red-500'
                          : 'text-gray-500'
                    }
                  >
                    {getStatusMessage()}
                  </span>
                </div>
              </div>

              {/* 系统信息 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Monitor size={16} className="text-emerald-500" />
                  系统信息
                </div>
                {loading ? (
                  <div className="text-sm text-gray-500">加载中...</div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">操作系统</span>
                      <span className="font-medium">{env?.os || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">技能目录</span>
                      <span className="font-medium text-xs truncate max-w-[180px]" title={env?.skillsDir}>
                        {env?.skillsDir || '未配置'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">目录状态</span>
                      <span className="flex items-center gap-1">
                        {env?.skillsDirExists ? (
                          <>
                            <Check size={14} className="text-green-500" />
                            <span className="text-green-600 text-xs">已创建</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} className="text-amber-500" />
                            <span className="text-amber-600 text-xs">未创建</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
