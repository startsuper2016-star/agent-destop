/**
 * 环境检测 Hook
 */

import { useState, useEffect, useCallback } from 'react'
import { EnvInfo } from '../types/skill'

export function useEnv() {
  const [env, setEnv] = useState<EnvInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const checkEnv = useCallback(async () => {
    setLoading(true)
    try {
      const result = await window.api.envCheck()
      setEnv(result)
    } catch (error) {
      console.error('环境检测失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkEnv()
  }, [checkEnv])

  return { env, loading, refetch: checkEnv }
}
