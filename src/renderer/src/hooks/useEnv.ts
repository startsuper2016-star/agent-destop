/**
 * 环境检测 Hook
 */

import { useState, useEffect } from 'react'
import { EnvInfo } from '../types/skill'

export function useEnv() {
  const [env, setEnv] = useState<EnvInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkEnv() {
      try {
        const result = await window.api.envCheck()
        setEnv(result)
      } catch (error) {
        console.error('环境检测失败:', error)
      } finally {
        setLoading(false)
      }
    }

    checkEnv()
  }, [])

  return { env, loading, refetch: () => setLoading(true) }
}