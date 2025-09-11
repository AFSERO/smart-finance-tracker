"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Wallet, 
  AlertCircle,
  Plus,
  Upload,
  Home,
  Car,
  Users,
  Calendar,
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  X
} from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useState } from "react"
import { TransactionForm } from "@/components/transaction-form"
import { signOut } from "next-auth/react"
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart"
import { SpendingCategoriesChart } from "@/components/charts/spending-categories-chart"
import { AssetAllocationChart } from "@/components/charts/asset-allocation-chart"

export function Dashboard() {
  const { data, isLoading, error, refetch } = useDashboardData()
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading dashboard data: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold">Personal Finance Tracker</h1>
            <div className="text-3xl font-bold text-green-400">{formatCurrency(data.balance)}</div>
            <div className="text-sm text-gray-400">Available Balance</div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-green-400 transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <Link href="/transactions" className="text-white hover:text-green-400 transition-colors">
              <TrendingUp className="w-5 h-5" />
            </Link>
            <Link href="/assets" className="text-white hover:text-green-400 transition-colors">
              <Wallet className="w-5 h-5" />
            </Link>
            <Link href="/upload" className="text-white hover:text-green-400 transition-colors">
              <Upload className="w-5 h-5" />
            </Link>
            <Link href="/settings" className="text-white hover:text-green-400 transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="text-sm">
                <div className="font-medium">Simon K. Jimmy</div>
                <div className="text-gray-400 text-xs">Mortgage consultant</div>
              </div>
              <button
                onClick={() => signOut()}
                className="ml-2 p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white hover:text-green-400 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700">
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/transactions" 
                className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Transactions</span>
              </Link>
              <Link 
                href="/assets" 
                className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Wallet className="w-5 h-5" />
                <span>Assets</span>
              </Link>
              <Link 
                href="/upload" 
                className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Upload className="w-5 h-5" />
                <span>Upload</span>
              </Link>
              <Link 
                href="/settings" 
                className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => {
                  signOut()
                  setMobileMenuOpen(false)
                }}
                className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 space-y-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">OL</span>
          </div>
          <div className="space-y-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
              <div 
                key={month}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer ${
                  index === 5 ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {month}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Quick Actions */}
          <div className="mb-6 flex flex-wrap gap-4">
            <Button 
              onClick={() => setShowTransactionForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
            <Link href="/upload">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload PDF
              </Button>
            </Link>
            <Link href="/transactions">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Transactions
              </Button>
            </Link>
            <Link href="/assets">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Wallet className="w-4 h-4 mr-2" />
                Manage Assets
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Total Net Worth - Large Card */}
            <div className="col-span-12 lg:col-span-6">
              <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0">
                <CardContent className="p-8">
                  <div className="text-white">
                    <h3 className="text-lg font-medium mb-2">Total Net Worth</h3>
                    <div className="text-4xl font-bold">{formatCurrency(data.netWorth)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Spendings - Top Right */}
            <div className="col-span-12 lg:col-span-3">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Spendings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-2">{formatCurrency(data.monthlyExpenses)}</div>
                  <div className="h-16 bg-gray-700 rounded flex items-end space-x-1">
                    <div className="w-2 bg-pink-500 h-8 rounded"></div>
                    <div className="w-2 bg-pink-500 h-12 rounded"></div>
                    <div className="w-2 bg-pink-500 h-6 rounded"></div>
                    <div className="w-2 bg-pink-500 h-10 rounded"></div>
                    <div className="w-2 bg-pink-500 h-14 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Income Goal */}
            <div className="col-span-12 lg:col-span-3">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Income Goal</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const pct = Math.min(100, Math.round((data.monthlyIncome / (data.monthlyGoal || 1)) * 100))
                    return (
                      <>
                        <div className="text-2xl font-bold text-white mb-2">{pct}%</div>
                        <div className="text-xs text-gray-400 mb-2">Progress to month</div>
                        <div className="text-sm text-white mb-2">{formatCurrency(data.monthlyIncome)} / {formatCurrency(data.monthlyGoal)}</div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Income Source */}
            <div className="col-span-12 lg:col-span-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Income Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'E-commerce', amount: '$2,100', color: 'bg-blue-500' },
                      { name: 'Google AdSense', amount: '$950', color: 'bg-green-500' },
                      { name: 'My Shop', amount: '$8,000', color: 'bg-yellow-500' },
                      { name: 'Salary', amount: '$13,000', color: 'bg-green-600' }
                    ].map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                          <span className="text-white text-sm">{source.name}</span>
                        </div>
                        <span className="text-white font-medium">{source.amount}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Spendings Categories */}
            <div className="col-span-12 lg:col-span-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Spendings</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpendingCategoriesChart data={data.chartData.spendingCategories} />
                </CardContent>
              </Card>
            </div>

            {/* Income */}
            <div className="col-span-12 lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-2">{formatCurrency(data.monthlyIncome)}</div>
                  <div className="h-16 bg-gray-700 rounded flex items-end space-x-1">
                    <div className="w-2 bg-orange-500 h-8 rounded"></div>
                    <div className="w-2 bg-orange-500 h-12 rounded"></div>
                    <div className="w-2 bg-orange-500 h-6 rounded"></div>
                    <div className="w-2 bg-orange-500 h-10 rounded"></div>
                    <div className="w-2 bg-orange-500 h-14 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notification */}
            <div className="col-span-12 lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center justify-between">
                    Notification
                    <Bell className="w-4 h-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-sm">{data.notifications[0]?.message || "You're all caught up!"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Income & Expenses Chart */}
            <div className="col-span-12 lg:col-span-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Income & Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <IncomeExpenseChart data={data.chartData.incomeExpense} />
                </CardContent>
              </Card>
            </div>

            {/* Assets */}
            <div className="col-span-12 lg:col-span-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <AssetAllocationChart data={data.chartData.assetAllocation} />
                  <div className="mt-4 space-y-3">
                    {data.assets.slice(0, 4).map((asset, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-white text-sm">{asset.name}</span>
                        <span className="text-white font-medium">{formatCurrency(asset.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pet Expenses */}
            <div className="col-span-12 lg:col-span-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Expenses for My Dogs and Cats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Routine Vet', amount: '$140' },
                      { name: 'Food', amount: '$950' },
                      { name: 'Food Treats', amount: '$231' },
                      { name: 'Kennel Boarding', amount: '$65' }
                    ].map((expense, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-white text-sm">{expense.name}</span>
                        <span className="text-white font-medium">{expense.amount}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          onClose={() => setShowTransactionForm(false)}
          onSuccess={() => {
            refetch()
            setShowTransactionForm(false)
          }}
        />
      )}
    </div>
  )
}