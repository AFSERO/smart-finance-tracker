"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface Settings {
  currency: string
  monthlyGoal: number
  theme: 'light' | 'dark'
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  isLoading: boolean
}

const defaultSettings: Settings = {
  currency: 'USD',
  monthlyGoal: 5000,
  theme: 'dark'
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load settings from localStorage or user preferences
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('finance-tracker-settings')
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          setSettings({ ...defaultSettings, ...parsed })
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    
    // Save to localStorage
    try {
      localStorage.setItem('finance-tracker-settings', JSON.stringify(updatedSettings))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
