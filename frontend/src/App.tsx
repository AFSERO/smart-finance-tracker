import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppProviders } from "@/components/Providers"
import { AuthPage } from "@/components/auth-page"
import { Navigation } from "@/components/navigation"
import { Dashboard } from "@/components/dashboard"
import { TransactionsPage } from "@/routes/TransactionsPage"
import { AssetsPage } from "@/routes/AssetsPage"
import { UploadPage } from "@/routes/UploadPage"
import { SettingsPage } from "@/routes/SettingsPage"
import { useAuth } from "@/contexts/AuthContext"

function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth()

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <main className="px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  )
}

function ProtectedRoute({ element }: { element: React.ReactNode }) {
  return <ProtectedShell>{element}</ProtectedShell>
}

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/transactions" element={<ProtectedRoute element={<TransactionsPage />} />} />
          <Route path="/assets" element={<ProtectedRoute element={<AssetsPage />} />} />
          <Route path="/upload" element={<ProtectedRoute element={<UploadPage />} />} />
          <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  )
}
