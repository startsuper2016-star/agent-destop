import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface BentoCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function BentoCard({ children, className = '', onClick }: BentoCardProps) {
  return (
    <motion.div
      className={`bento-card cursor-pointer ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
