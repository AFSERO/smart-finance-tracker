import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Wallet, BarChart3 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/80 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Smart Finance Tracker</h2>
          <p className="text-sm text-gray-400">Track spending, monitor assets, and stay on top of your goals.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <Wallet className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-xs text-gray-300">Track Assets</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <BarChart3 className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-xs text-gray-300">Insights</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <TrendingUp className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-xs text-gray-300">Reach Goals</p>
          </div>
        </div>

        <Card className="bg-gray-800 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              {mode === "login" ? "Sign in to your account" : "Create your account"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {mode === "login"
                ? "Enter your credentials to access your dashboard"
                : "Get started in less than a minute"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 bg-gray-900 border-gray-700 text-white"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setMode((current) => (current === "login" ? "register" : "login"))}
                className="text-sm text-primary hover:text-primary/80"
              >
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
