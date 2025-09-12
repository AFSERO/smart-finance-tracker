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
import { useState, useEffect, useCallback } from "react"
import { TransactionForm } from "@/components/transaction-form"
import { signOut, useSession } from "next-auth/react"
import { useSettings } from "@/contexts/settings-context"
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart"
import { SpendingCategoriesChart } from "@/components/charts/spending-categories-chart"
import { AssetAllocationChart } from "@/components/charts/asset-allocation-chart"
import { Responsive, WidthProvider } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

const ResponsiveGridLayout = WidthProvider(Responsive)

export function Dashboard() {
  const { data, isLoading, error, refetch } = useDashboardData()
  const { data: session } = useSession()
  const { settings } = useSettings()
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [layouts, setLayouts] = useState<any>({})

  // Default layout configuration
  const defaultLayouts = {
    lg: [
      { i: 'net-worth', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'income-sources', x: 0, y: 2, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'spendings', x: 3, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
      { i: 'income-goal', x: 5, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
      { i: 'income', x: 7, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
      { i: 'notifications', x: 9, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
      { i: 'income-expense-chart', x: 3, y: 2, w: 4, h: 3, minW: 3, minH: 2 },
      { i: 'assets', x: 7, y: 2, w: 4, h: 3, minW: 3, minH: 2 },
      { i: 'recent-transactions', x: 0, y: 5, w: 12, h: 2, minW: 6, minH: 2 }
    ],
    md: [
      { i: 'net-worth', x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'income-sources', x: 0, y: 2, w: 6, h: 3, minW: 4, minH: 2 },
      { i: 'spendings', x: 6, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'income-goal', x: 6, y: 2, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'income', x: 0, y: 5, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'notifications', x: 6, y: 4, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'income-expense-chart', x: 0, y: 7, w: 12, h: 3, minW: 6, minH: 2 },
      { i: 'assets', x: 0, y: 10, w: 12, h: 3, minW: 6, minH: 2 },
      { i: 'recent-transactions', x: 0, y: 13, w: 12, h: 2, minW: 6, minH: 2 }
    ],
    sm: [
      { i: 'net-worth', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'income-sources', x: 0, y: 2, w: 12, h: 3, minW: 6, minH: 2 },
      { i: 'spendings', x: 0, y: 5, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'income-goal', x: 0, y: 7, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'income', x: 0, y: 9, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'notifications', x: 0, y: 11, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'income-expense-chart', x: 0, y: 13, w: 12, h: 3, minW: 6, minH: 2 },
      { i: 'assets', x: 0, y: 16, w: 12, h: 3, minW: 6, minH: 2 },
      { i: 'recent-transactions', x: 0, y: 19, w: 12, h: 2, minW: 6, minH: 2 }
    ]
  }

  // Initialize layouts
  useEffect(() => {
    if (Object.keys(layouts).length === 0) {
      setLayouts(defaultLayouts)
    }
  }, [])

  // Handle layout changes
  const handleLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts)
  }

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refetch()
    setLastRefresh(new Date())
    setIsRefreshing(false)
  }, [refetch])

  // Widget Components
  const NetWorthWidget = () => (
    <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0 h-full">
      <CardContent className="p-6 lg:p-8 h-full flex flex-col justify-center">
        <div className="text-white">
          <h3 className="text-lg font-medium mb-2">Total Net Worth</h3>
          <div className="text-3xl lg:text-4xl font-bold">{formatCurrency(data.netWorth)}</div>
        </div>
      </CardContent>
    </Card>
  )

  const IncomeSourcesWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">Income Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data?.chartData?.spendingCategories?.length > 0 ? (
            data.chartData.spendingCategories
              .filter(cat => cat.name !== 'Other')
              .slice(0, 4)
              .map((source, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: source.color }}
                    ></div>
                    <span className="text-white text-sm font-medium">{source.name}</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{formatCurrency(source.value)}</span>
                </div>
              ))
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">No income data available</p>
              <p className="text-gray-500 text-xs mt-1">Add some transactions to see your income sources</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const SpendingsWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm">Spendings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl lg:text-2xl font-bold text-white mb-2">{formatCurrency(data.monthlyExpenses)}</div>
        <div className="h-12 lg:h-16 bg-gray-700 rounded flex items-end space-x-1">
          <div className="w-2 bg-pink-500 h-6 lg:h-8 rounded"></div>
          <div className="w-2 bg-pink-500 h-8 lg:h-12 rounded"></div>
          <div className="w-2 bg-pink-500 h-4 lg:h-6 rounded"></div>
          <div className="w-2 bg-pink-500 h-6 lg:h-10 rounded"></div>
          <div className="w-2 bg-pink-500 h-10 lg:h-14 rounded"></div>
        </div>
      </CardContent>
    </Card>
  )

  const IncomeGoalWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm">Income Goal</CardTitle>
      </CardHeader>
      <CardContent>
        {(() => {
          const monthlyGoal = settings.monthlyGoal || 5000
          const pct = Math.min(100, Math.round((data.monthlyIncome / monthlyGoal) * 100))
          return (
            <>
              <div className="text-xl lg:text-2xl font-bold text-white mb-2">{pct}%</div>
              <div className="text-xs text-gray-400 mb-2">Progress to goal</div>
              <div className="text-sm text-white mb-2">{formatCurrency(data.monthlyIncome)} / {formatCurrency(monthlyGoal)}</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
              </div>
            </>
          )
        })()}
      </CardContent>
    </Card>
  )

  const IncomeWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm">Income</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl lg:text-2xl font-bold text-white mb-2">{formatCurrency(data.monthlyIncome)}</div>
        <div className="h-12 lg:h-16 bg-gray-700 rounded flex items-end space-x-1">
          <div className="w-2 bg-orange-500 h-6 lg:h-8 rounded"></div>
          <div className="w-2 bg-orange-500 h-8 lg:h-12 rounded"></div>
          <div className="w-2 bg-orange-500 h-4 lg:h-6 rounded"></div>
          <div className="w-2 bg-orange-500 h-6 lg:h-10 rounded"></div>
          <div className="w-2 bg-orange-500 h-10 lg:h-14 rounded"></div>
        </div>
      </CardContent>
    </Card>
  )

  const NotificationsWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center justify-between">
          Notifications
          <Bell className="w-4 h-4" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.notifications.length > 0 ? (
            data.notifications.slice(0, 2).map((notification, index) => (
              <div 
                key={index} 
                className={`text-sm p-2 rounded ${
                  notification.type === 'warning' ? 'bg-red-900/20 text-red-300' :
                  notification.type === 'success' ? 'bg-green-900/20 text-green-300' :
                  'bg-blue-900/20 text-blue-300'
                }`}
              >
                {notification.message}
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">You're all caught up!</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const IncomeExpenseChartWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader>
        <CardTitle className="text-white">Income & Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <IncomeExpenseChart data={data.chartData.incomeExpense} />
      </CardContent>
    </Card>
  )

  const AssetsWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader>
        <CardTitle className="text-white">Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <AssetAllocationChart data={data.chartData.assetAllocation} />
        <div className="mt-4 space-y-3">
          {data.assets.slice(0, 4).map((asset, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-white text-sm">{asset.name}</span>
              <span className="text-white font-medium text-sm lg:text-base">{formatCurrency(asset.value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const RecentTransactionsWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader>
        <CardTitle className="text-white">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data?.recentTransactions?.length > 0 ? (
            data.recentTransactions.slice(0, 4).map((transaction, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm truncate block">{transaction.description}</span>
                  <span className="text-gray-400 text-xs">{new Date(transaction.date).toLocaleDateString()}</span>
                </div>
                <span className={`font-medium text-sm lg:text-base ${
                  transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">No recent transactions</p>
              <p className="text-gray-500 text-xs mt-1">Add some transactions to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-6">Error: {error}</p>
          <div className="space-x-4">
            <Button onClick={refetch} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading Dashboard</h2>
          <p className="text-gray-400">Please wait while we load your financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 lg:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <h1 className="text-xl lg:text-2xl font-bold">Personal Finance Tracker</h1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="text-2xl lg:text-3xl font-bold text-green-400">{formatCurrency(data.balance)}</div>
              <div className="text-sm text-gray-400">
                Available Balance
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                  {isRefreshing && (
                    <div className="ml-2 w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </div>
            </div>
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
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <TrendingUp className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="text-right">
              <div className="text-sm text-gray-400">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                {session?.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="text-sm">
                <div className="font-medium">{session?.user?.name || "User"}</div>
                <div className="text-gray-400 text-xs">{session?.user?.email || "No email"}</div>
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
        {/* Fixed Sidebar - Always pinned to the left */}
        <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 space-y-4 flex-shrink-0">
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

        {/* Main Content Area with Drag-and-Drop Grid */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Quick Actions */}
          <div className="mb-6 flex flex-wrap gap-2 lg:gap-4">
            <Button 
              onClick={() => setShowTransactionForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <Link href="/upload">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upload PDF</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </Link>
            <Link href="/transactions">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">View Transactions</span>
                <span className="sm:hidden">Transactions</span>
              </Button>
            </Link>
            <Link href="/assets">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Wallet className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Manage Assets</span>
                <span className="sm:hidden">Assets</span>
              </Button>
            </Link>
          </div>

          {/* Drag-and-Drop Grid Layout */}
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
            rowHeight={60}
            isDraggable={true}
            isResizable={true}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            useCSSTransforms={true}
          >
            <div key="net-worth">
              <NetWorthWidget />
            </div>
            <div key="income-sources">
              <IncomeSourcesWidget />
            </div>
            <div key="spendings">
              <SpendingsWidget />
            </div>
            <div key="income-goal">
              <IncomeGoalWidget />
            </div>
            <div key="income">
              <IncomeWidget />
            </div>
            <div key="notifications">
              <NotificationsWidget />
            </div>
            <div key="income-expense-chart">
              <IncomeExpenseChartWidget />
            </div>
            <div key="assets">
              <AssetsWidget />
            </div>
            <div key="recent-transactions">
              <RecentTransactionsWidget />
            </div>
          </ResponsiveGridLayout>
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
