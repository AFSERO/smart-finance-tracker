"use client"

import { useSession } from "next-auth/react"
import { Navigation } from "@/components/navigation"
import { Dashboard } from "@/components/dashboard"
import { AuthPage } from "@/components/auth-page"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <main className="max-w-70xl mx-auto py-6 sm:px-6 lg:px-8">
        <Dashboard />
      </main>
    </div>
  )
}
