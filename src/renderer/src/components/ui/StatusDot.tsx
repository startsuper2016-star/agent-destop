import { KeyTestResult } from '../../types/skill'

interface StatusDotProps {
  status: KeyTestResult['status']
}

export function StatusDot({ status }: StatusDotProps) {
  const statusClass = {
    unconfigured: 'status-error',
    pending: 'status-pending',
    ready: 'status-ready',
    error: 'status-error'
  }[status]

  return <div className={`status-dot ${statusClass}`} />
}
