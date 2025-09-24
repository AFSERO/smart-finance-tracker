import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { API_URL, apiFetch } from "@/lib/api"

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  currency: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  initializing: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const STORAGE_KEY = "sft-auth-token"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [initializing, setInitializing] = useState(true)

  const fetchProfile = useCallback(async (authToken: string) => {
    const profile = await apiFetch<AuthUser>("/auth/me", { method: "GET" }, authToken)
    setUser(profile)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      setInitializing(false)
      return
    }
    setToken(stored)
    fetchProfile(stored)
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setInitializing(false))
  }, [fetchProfile])

  const login = useCallback(async (email: string, password: string) => {
    const body = new URLSearchParams()
    body.append("username", email)
    body.append("password", password)

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    })

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}))
      const detail = errorPayload?.detail || "Unable to login"
      throw new Error(detail)
    }

    const data = (await response.json()) as { access_token: string }
    localStorage.setItem(STORAGE_KEY, data.access_token)
    setToken(data.access_token)
    await fetchProfile(data.access_token)
  }, [fetchProfile])

  const register = useCallback(async (name: string, email: string, password: string) => {
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
    await login(email, password)
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, token, initializing, login, register, logout }),
    [user, token, initializing, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
