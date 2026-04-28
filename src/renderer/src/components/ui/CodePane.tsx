import { ReactNode } from 'react'

interface CodePaneProps {
  children: ReactNode
  className?: string
}

export function CodePane({ children, className = '' }: CodePaneProps) {
  return <div className={`code-pane ${className}`}>{children}</div>
}
