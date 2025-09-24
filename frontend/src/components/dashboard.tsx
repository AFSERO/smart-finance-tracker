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
import { NavLink } from "react-router-dom"
import { formatCurrency } from "@/lib/utils"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useState, useEffect, useCallback } from "react"
import { TransactionForm } from "@/components/transaction-form"
import { useAuth } from "@/contexts/AuthContext"
import { useSettings } from "@/contexts/SettingsContext"
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart"
import { SpendingCategoriesChart } from "@/components/charts/spending-categories-chart"
import { AssetAllocationChart } from "@/components/charts/asset-allocation-chart"
import { Responsive, WidthProvider } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { useMemo } from "react"

// Custom styles for the grid layout
const gridStyles = `
  .react-grid-layout {
    position: relative;
  }
  .react-grid-item {
    transition: all 200ms ease;
    transition-property: left, top;
  }
  .react-grid-item.cssTransforms {
    transition-property: transform;
  }
  .react-grid-item > .react-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNIDYgNiBMIDYgMCBMIDAgNiBaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo=');
    background-position: bottom right;
    padding: 0 3px 3px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: se-resize;
  }
  .react-grid-item.react-grid-placeholder {
    background: rgba(59, 130, 246, 0.1);
    border: 2px dashed rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    opacity: 0.2;
    transition-duration: 100ms;
    z-index: 2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
  }
  .react-grid-item.react-draggable-dragging {
    transition: none;
    z-index: 3;
    will-change: transform;
  }
  .react-grid-item.dropping {
    visibility: hidden;
  }
  .react-grid-item.react-grid-placeholder {
    background: rgba(59, 130, 246, 0.1);
    border: 2px dashed rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    opacity: 0.2;
    transition-duration: 100ms;
    z-index: 2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
  }
`

const ResponsiveGridLayout = WidthProvider(Responsive)

export function Dashboard() {
  const today = new Date()
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(today.getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear())
  const { data, isLoading, error, refetch } = useDashboardData(selectedYear, selectedMonthIndex)
  const { user, logout } = useAuth()
  if (!user) {
    return null
  }
  const { settings } = useSettings()
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [layouts, setLayouts] = useState<any>({})

  // Default layout configuration for ultra-wide screens (3500x1231)
  const defaultLayouts = {
    lg: [
      { i: 'net-worth', x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
      { i: 'income-sources', x: 0, y: 2, w: 4, h: 2, minW: 3, minH: 2 },
      { i: 'spendings', x: 4, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'income-goal', x: 7, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'income', x: 10, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'notifications', x: 13, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'income-expense-chart', x: 4, y: 2, w: 6, h: 4.5, minW: 4, minH: 4.5 },
      { i: 'assets', x: 10, y: 2, w: 6, h: 5, minW: 4, minH: 5 },
      { i: 'recent-transactions', x: 0, y: 4, w: 3, h: 2, minW: 2, minH: 2 }
    ],
    md: [
      { i: 'net-worth', x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'income-sources', x: 0, y: 2, w: 6, h: 3, minW: 4, minH: 2 },
      { i: 'spendings', x: 6, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'income-goal', x: 6, y: 2, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'income', x: 0, y: 5, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'notifications', x: 6, y: 4, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'income-expense-chart', x: 0, y: 7, w: 12, h: 4.5, minW: 6, minH: 4.5 },
      { i: 'assets', x: 0, y: 10, w: 12, h: 5, minW: 6, minH: 5 },
      { i: 'recent-transactions', x: 0, y: 13, w: 3, h: 2, minW: 2, minH: 2 }
    ],
    sm: [
      { i: 'net-worth', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'income-sources', x: 0, y: 2, w: 12, h: 3, minW: 6, minH: 2 },
      { i: 'spendings', x: 0, y: 5, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'income-goal', x: 0, y: 7, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'income', x: 0, y: 9, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'notifications', x: 0, y: 11, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'income-expense-chart', x: 0, y: 13, w: 12, h: 4.5, minW: 6, minH: 4.5 },
      { i: 'assets', x: 0, y: 16, w: 12, h: 5, minW: 6, minH: 5 },
      { i: 'recent-transactions', x: 0, y: 19, w: 3, h: 2, minW: 2, minH: 2 }
    ]
  }

  // Initialize layouts
  useEffect(() => {
    // Clear any existing layout cache and force reset
    localStorage.removeItem('react-grid-layout')
    setLayouts(defaultLayouts)
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

  const handleMonthClick = (index: number) => {
    setSelectedMonthIndex(index)
    setSelectedYear(today.getFullYear())
  }

  const isFutureSelected = () => {
    const now = new Date()
    const selected = new Date(selectedYear, selectedMonthIndex, 1)
    return selected > new Date(now.getFullYear(), now.getMonth(), 1)
  }

  // Widget Components
  const NetWorthWidget = () => (
    <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0 h-full overflow-hidden">
      <CardContent className="p-6 lg:p-8 h-full flex flex-col justify-center overflow-hidden">
        <div className="text-white overflow-hidden">
          <h3 className="text-lg font-medium mb-2 truncate">Total Net Worth</h3>
          <div className="text-3xl lg:text-4xl font-bold break-words">{formatCurrency(data?.netWorth || 0)}</div>
        </div>
      </CardContent>
    </Card>
  )

  const IncomeSourcesWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg truncate">Income Sources</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="space-y-3 overflow-y-auto max-h-full">
          {data?.chartData?.spendingCategories && data.chartData.spendingCategories.length > 0 ? (
            data.chartData.spendingCategories
              .filter(cat => cat.name !== 'Other')
              .slice(0, 4)
              .map((source, index) => (
                <div key={index} className="flex items-center justify-between py-2 min-w-0">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: source.color }}
                    ></div>
                    <span className="text-white text-sm font-medium truncate">{source.name}</span>
                  </div>
                  <span className="text-white font-semibold text-sm truncate ml-2">{formatCurrency(source.value)}</span>
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
    <Card className="bg-gray-800 border-gray-700 h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm truncate">Spendings</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="text-xl lg:text-2xl font-bold text-white mb-2 truncate">{formatCurrency(data?.monthlyExpenses || 0)}</div>
        <div className="h-12 lg:h-16 bg-gray-700 rounded flex items-end space-x-1 overflow-hidden">
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
    <Card className="bg-gray-800 border-gray-700 h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm truncate">Income Goal</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {(() => {
          const monthlyGoal = settings.monthlyGoal || 5000
          const monthlyIncome = data?.monthlyIncome || 0
          const pct = Math.min(100, Math.round((monthlyIncome / monthlyGoal) * 100))
          return (
            <>
              <div className="text-xl lg:text-2xl font-bold text-white mb-2 truncate">{pct}%</div>
              <div className="text-xs text-gray-400 mb-2 truncate">Progress to goal</div>
              <div className="text-sm text-white mb-2 truncate">{formatCurrency(monthlyIncome)} / {formatCurrency(monthlyGoal)}</div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
              </div>
            </>
          )
        })()}
      </CardContent>
    </Card>
  )

  const IncomeWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm truncate">Income</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="text-xl lg:text-2xl font-bold text-white mb-2 truncate">{formatCurrency(data?.monthlyIncome || 0)}</div>
        <div className="h-12 lg:h-16 bg-gray-700 rounded flex items-end space-x-1 overflow-hidden">
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
    <Card className="bg-gray-800 border-gray-700 h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center justify-between truncate">
          <span className="truncate">Notifications</span>
          <Bell className="w-4 h-4 flex-shrink-0" />
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="space-y-2 overflow-y-auto max-h-full">
          {data?.notifications && data.notifications.length > 0 ? (
            data.notifications.slice(0, 2).map((notification, index) => (
              <div 
                key={index} 
                className={`text-sm p-2 rounded break-words ${
                  notification.type === 'warning' ? 'bg-red-900/20 text-red-300' :
                  notification.type === 'success' ? 'bg-green-900/20 text-green-300' :
                  'bg-blue-900/20 text-blue-300'
                }`}
              >
                {notification.message}
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm truncate">You're all caught up!</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const IncomeExpenseChartWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white truncate">Income & Expenses</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="overflow-hidden">
          <IncomeExpenseChart data={data?.chartData?.incomeExpense || []} />
        </div>
      </CardContent>
    </Card>
  )

  const AssetsWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white truncate">Assets</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="overflow-hidden">
          <AssetAllocationChart data={data?.chartData?.assetAllocation || []} />
        </div>
        <div className="mt-4 space-y-3 overflow-y-auto max-h-48">
          {data?.rawAssets && data.rawAssets.slice(0, 6).map((asset) => (
            <AssetRow key={asset.id} asset={asset} onUpdated={refetch} />
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const AssetRow = ({ asset, onUpdated }: { asset: any; onUpdated: () => void }) => {
    const [updating, setUpdating] = useState(false)
    const [manualValue, setManualValue] = useState<string>(asset.currentValue?.toString() || "")
    const hasPriceUrl = !!asset.assetData?.priceUrl
    const priceField = asset.assetData?.priceField || "price"

    const purchaseInfo = useMemo(() => {
      const price = asset.purchasePrice ?? null
      const date = asset.purchaseDate ? new Date(asset.purchaseDate) : null
      return {
        priceLabel: price != null ? formatCurrency(price) : "-",
        dateLabel: date ? date.toLocaleDateString() : ""
      }
    }, [asset.purchasePrice, asset.purchaseDate])

    const fetchAndUpdate = async () => {
      if (!hasPriceUrl) return
      try {
        setUpdating(true)
        const res = await fetch(asset.assetData.priceUrl)
        const json = await res.json()
        const unitPrice = json?.[priceField]
        if (typeof unitPrice !== 'number') {
          throw new Error('Invalid price response')
        }
        const newValue = unitPrice * (asset.quantity || 0)
        await fetch(`/api/assets/${asset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentValue: newValue })
        })
        onUpdated()
      } catch (e) {
        console.error(e)
      } finally {
        setUpdating(false)
      }
    }

    const saveManual = async () => {
      try {
        setUpdating(true)
        const valueNum = parseFloat(manualValue || '0')
        await fetch(`/api/assets/${asset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentValue: valueNum })
        })
        onUpdated()
      } catch (e) {
        console.error(e)
      } finally {
        setUpdating(false)
      }
    }

    return (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm truncate">{asset.name}</div>
          <div className="text-xs text-gray-400 truncate">Qty: {asset.quantity} • Purchase: {purchaseInfo.priceLabel}{purchaseInfo.dateLabel ? ` on ${purchaseInfo.dateLabel}` : ''}</div>
        </div>
        <div className="flex items-center gap-2">
          {hasPriceUrl ? (
            <button
              className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
              onClick={fetchAndUpdate}
              disabled={updating}
            >
              {updating ? 'Updating…' : 'Update Price'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                className="w-28 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                placeholder="Current value"
              />
              <button
                className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
                onClick={saveManual}
                disabled={updating}
              >
                {updating ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
          <div className="text-white font-medium text-sm lg:text-base truncate ml-1 min-w-[90px] text-right">
            {formatCurrency(asset.currentValue || 0)}
          </div>
        </div>
      </div>
    )
  }

  const RecentTransactionsWidget = () => (
    <Card className="bg-gray-800 border-gray-700 h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white truncate">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="space-y-3 overflow-y-auto max-h-full">
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            data.recentTransactions.slice(0, 4).map((transaction, index) => (
              <div key={index} className="flex justify-between items-center min-w-0">
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm truncate block">{transaction.description}</span>
                  <span className="text-gray-400 text-xs truncate">{new Date(transaction.date).toLocaleDateString()}</span>
                </div>
                <span className={`font-medium text-sm lg:text-base truncate ml-2 ${
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
      <div className="flex items-center justify-center py-12">
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading Dashboard</h2>
          <p className="text-gray-400">Please wait while we load your financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full text-white overflow-hidden">
      {/* Custom Grid Styles */}
      <style dangerouslySetInnerHTML={{ __html: gridStyles }} />
      
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 lg:px-6 py-2">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <h1 className="text-xl lg:text-2xl font-bold">{user?.name || user?.email || "Personal Finance Tracker"}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="text-2xl lg:text-3xl font-bold text-green-400">{formatCurrency(data.balance)}</div>
              <div className="text-sm text-gray-400">
                {isFutureSelected() ? 'Future Balance' : 'Available Balance'}
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                  {isRefreshing && (
                    <div className="ml-2 w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </div>
            </div>
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
              <div className="text-sm text-gray-400">{new Date(selectedYear, selectedMonthIndex, 1).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</div>
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
              <NavLink 
                to="/" 
                className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink 
                to="/transactions" 
                className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Transactions</span>
              </NavLink>
              <NavLink 
                to="/assets" 
                className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Wallet className="w-5 h-5" />
                <span>Assets</span>
              </NavLink>
              <NavLink 
                to="/upload" 
                className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Upload className="w-5 h-5" />
                <span>Upload</span>
              </NavLink>
              <NavLink 
                to="/settings" 
                className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </NavLink>
              <button
                onClick={() => {
                  logout()
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

      <div className="flex h-full">
        {/* Fixed Sidebar - Always pinned to the left */}
        <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 space-y-4 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">OL</span>
          </div>
          <div className="space-y-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
              <button
                type="button"
                onClick={() => handleMonthClick(index)}
                key={month}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer transition-colors ${
                  index === selectedMonthIndex ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title={`${month} ${new Date().getFullYear()}`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area with Drag-and-Drop Grid */}
        <div className="flex-1 p-2 lg:p-4 h-full overflow-hidden">
          {/* Quick Actions */}
          <div className="mb-3 flex flex-wrap gap-2 lg:gap-4">
            <Button 
              onClick={() => setShowTransactionForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <NavLink to="/upload">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upload PDF</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </NavLink>
            <NavLink to="/transactions">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">View Transactions</span>
                <span className="sm:hidden">Transactions</span>
              </Button>
            </NavLink>
            <NavLink to="/assets">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Wallet className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Manage Assets</span>
                <span className="sm:hidden">Assets</span>
              </Button>
            </NavLink>
          </div>

          {/* Drag-and-Drop Grid Layout */}
          <div className="overflow-hidden">
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              onLayoutChange={handleLayoutChange}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 16, md: 12, sm: 12, xs: 12, xxs: 12 }}
              rowHeight={80}
              isDraggable={true}
              isResizable={true}
              margin={[12, 12]}
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
