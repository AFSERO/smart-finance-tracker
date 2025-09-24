import { NavLink } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  Home,
  TrendingUp,
  Wallet,
  Upload as UploadIcon,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import clsx from "clsx"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Transactions", href: "/transactions", icon: TrendingUp },
  { name: "Assets", href: "/assets", icon: Wallet },
  { name: "Upload", href: "/upload", icon: UploadIcon },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Navigation() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) {
    return null
  }

  const renderNavLink = (item: typeof navigation[number]) => {
    const Icon = item.icon
    return (
      <NavLink
        key={item.name}
        to={item.href}
        className={({ isActive }) =>
          clsx(
            "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors",
            isActive ? "text-green-400 border-green-400" : "text-gray-300 border-transparent hover:text-green-400 hover:border-green-400"
          )
        }
        onClick={() => setMobileMenuOpen(false)}
      >
        <Icon className="w-4 h-4 mr-2" />
        {item.name}
      </NavLink>
    )
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <NavLink to="/" className="text-xl font-bold text-white">
                Smart Finance Tracker
              </NavLink>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map(renderNavLink)}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">{user.name || user.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center border-gray-600 text-white hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
          <div className="sm:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="text-white hover:text-green-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden bg-gray-800 border-t border-gray-700">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map(renderNavLink)}
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="px-4 text-base font-medium text-white">{user.name || user.email}</div>
              <div className="mt-3 px-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center border-gray-600 text-white hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
