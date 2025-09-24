import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSettings } from "@/contexts/SettingsContext"
import { useAuth } from "@/contexts/AuthContext"
import { User, Bell, Shield, Trash2, Save, Target } from "lucide-react"

interface NotificationPreferences {
  email: boolean
  push: boolean
  weekly: boolean
  monthly: boolean
}

export function SettingsPage() {
  const { user } = useAuth()
  const { settings: appSettings, updateSettings } = useSettings()
  const [isSaving, setIsSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: false,
    weekly: true,
    monthly: true,
  })
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    currency: appSettings.currency,
    monthlyGoal: appSettings.monthlyGoal,
  })

  useEffect(() => {
    if (user) {
      setFormState((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email,
        currency: appSettings.currency,
        monthlyGoal: appSettings.monthlyGoal,
      }))
    }
  }, [user, appSettings.currency, appSettings.monthlyGoal])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      updateSettings({
        currency: formState.currency,
        monthlyGoal: formState.monthlyGoal,
      })
      await new Promise((resolve) => setTimeout(resolve, 600))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Account deletion requested")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Manage preferences and personal details.</p>
      </div>

      <Card className="bg-gray-800 border border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <User className="w-5 h-5 mr-2" /> Profile Information
          </CardTitle>
          <CardDescription className="text-gray-400">Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <Input
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Enter your full name"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <Input
                type="email"
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Enter your email"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Default Currency</label>
              <select
                className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 text-white"
                value={formState.currency}
                onChange={(event) => setFormState((prev) => ({ ...prev, currency: event.target.value }))}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Income Goal</label>
              <Input
                type="number"
                value={formState.monthlyGoal}
                onChange={(event) => setFormState((prev) => ({ ...prev, monthlyGoal: Number(event.target.value) || 0 }))}
                placeholder="Enter monthly goal"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Target className="w-5 h-5 mr-2" /> Financial Goals
          </CardTitle>
          <CardDescription className="text-gray-400">Adjust your targets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Income Goal</label>
              <Input
                type="number"
                value={formState.monthlyGoal}
                onChange={(event) => setFormState((prev) => ({ ...prev, monthlyGoal: Number(event.target.value) || 0 }))}
                className="bg-gray-900 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Set your target monthly income.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Savings Goal</label>
              <Input type="number" placeholder="Coming soon" disabled className="bg-gray-900 border-gray-800 text-gray-500" />
              <p className="text-xs text-gray-500 mt-1">Savings targets will be available in a future release.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Bell className="w-5 h-5 mr-2" /> Notifications
          </CardTitle>
          <CardDescription className="text-gray-400">Choose how we keep you informed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {(
              [
                { key: "email", label: "Email alerts", description: "Receive important updates by email." },
                { key: "push", label: "Push notifications", description: "Get push alerts on supported devices." },
                { key: "weekly", label: "Weekly summary", description: "Weekly digest of your finances." },
                { key: "monthly", label: "Monthly report", description: "Comprehensive monthly report." },
              ] as const
            ).map(({ key, label, description }) => (
              <label key={key} className="flex items-start justify-between bg-gray-900 border border-gray-700 rounded-lg p-3 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-400">{description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences[key]}
                  onChange={(event) => setPreferences((prev) => ({ ...prev, [key]: event.target.checked }))}
                  className="w-4 h-4 mt-1"
                />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Shield className="w-5 h-5 mr-2" /> Security & Privacy
          </CardTitle>
          <CardDescription className="text-gray-400">Manage account safety.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div>
              <p className="text-sm font-medium text-white">Two-factor authentication</p>
              <p className="text-xs text-gray-400">Coming soon: add an extra layer of security.</p>
            </div>
            <Button variant="outline" className="mt-3 sm:mt-0 border-gray-600 text-white" disabled>
              Manage
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div>
              <p className="text-sm font-medium text-white">Delete account</p>
              <p className="text-xs text-gray-400">Remove your account and all associated data.</p>
            </div>
            <Button variant="outline" className="mt-3 sm:mt-0 border-red-500 text-red-400" onClick={handleDeleteAccount}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
