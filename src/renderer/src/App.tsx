import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { Sidebar } from './components/layout/Sidebar'
import { SettingsPanel } from './components/layout/SettingsPanel'
import { Home } from './components/features/Home'
import { SkillsList } from './components/features/SkillsList'
import { AICreator } from './components/features/AICreator'
import { ManualEditor } from './components/features/ManualEditor'
import { AppStep } from './types/skill'

const API_KEY_STORAGE_KEY = 'zhike_api_key'

function App() {
  const [step, setStep] = useState<AppStep>('home')
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (savedKey) {
      setApiKey(savedKey)
    }
  }, [])

  const handleApiKeyChange = (key: string) => {
    setApiKey(key)
    localStorage.setItem(API_KEY_STORAGE_KEY, key)
  }

  const handleNavigate = (targetStep: AppStep) => {
    setStep(targetStep)
  }

  return (
    <div className="app-layout">
      <Toaster position="top-center" richColors />

      <Sidebar
        step={step}
        onStepChange={handleNavigate}
        onSettingsOpen={() => setStep('settings')}
      />

      <main className="app-main">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div
              key="home"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Home onNavigate={handleNavigate} />
            </motion.div>
          )}

          {step === 'skills' && (
            <motion.div
              key="skills"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SkillsList onCreateSkill={() => setStep('home')} />
            </motion.div>
          )}

          {step === 'ai' && (
            <motion.div
              key="ai"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <AICreator apiKey={apiKey} onBack={() => setStep('home')} />
            </motion.div>
          )}

          {step === 'editor' && (
            <motion.div
              key="editor"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ManualEditor onBack={() => setStep('home')} />
            </motion.div>
          )}

          {step === 'settings' && (
            <motion.div
              key="settings"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SettingsPanel
                apiKey={apiKey}
                onApiKeyChange={handleApiKeyChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
