import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

type ThemeMode = "light" | "dark"

interface Settings {
  currency: string
  monthlyGoal: number
  theme: ThemeMode
}

interface SettingsContextValue {
  settings: Settings
  isLoading: boolean
  updateSettings: (patch: Partial<Settings>) => void
}

const defaultSettings: Settings = {
  currency: "USD",
  monthlyGoal: 5000,
  theme: "dark",
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const key = user ? `sft-settings-${user.id}` : "sft-settings"
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings({ ...defaultSettings, ...parsed })
      } else if (user?.currency) {
        setSettings((prev) => ({ ...prev, currency: user.currency }))
      }
    } catch (error) {
      console.error("Failed to load settings", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      const key = user ? `sft-settings-${user.id}` : "sft-settings"
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch (error) {
        console.error("Failed to persist settings", error)
      }
      return next
    })
  }

  const value = useMemo(() => ({ settings, isLoading, updateSettings }), [settings, isLoading])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
