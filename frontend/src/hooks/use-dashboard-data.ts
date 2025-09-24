import { useCallback, useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardData {
  balance: number
  netWorth: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyGoal: number
  assets: Array<{ name: string; value: number; change: number }>
  rawAssets: Array<{
    id: string
    name: string
    type: string
    quantity: number
    currentValue: number
    purchasePrice?: number | null
    purchaseDate?: string | null
    assetData?: any
  }>
  recentTransactions: Array<{
    description: string
    amount: number
    type: "income" | "expense"
    date: string
  }>
  notifications: Array<{
    message: string
    type: "warning" | "success" | "info"
  }>
  chartData: {
    incomeExpense: Array<{ month: string; income: number; expenses: number; balance: number }>
    spendingCategories: Array<{ name: string; value: number; color: string }>
    assetAllocation: Array<{ name: string; value: number; color: string }>
  }
}

export function useDashboardData(selectedYear?: number, selectedMonthIndex?: number) {
  const { token } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  const fetchDashboardData = useCallback(
    async (forceRefresh = false) => {
      if (!token) {
        return
      }
      const now = Date.now()
      if (!forceRefresh && data && now - lastFetch < 120000) {
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const current = new Date()
        const targetYear = typeof selectedYear === "number" ? selectedYear : current.getFullYear()
        const targetMonthIndex = typeof selectedMonthIndex === "number" ? selectedMonthIndex : current.getMonth()
        const startOfMonth = new Date(targetYear, targetMonthIndex, 1)
        const endOfMonth = new Date(targetYear, targetMonthIndex + 1, 0)

        const monthsBack = 6
        const startOfSeries = new Date(targetYear, targetMonthIndex - (monthsBack - 1), 1)
        const startOfCumulative = new Date(startOfSeries.getFullYear(), 0, 1)

        const query = new URLSearchParams({
          start_date: startOfCumulative.toISOString(),
          end_date: endOfMonth.toISOString(),
          limit: "1000",
        })

        const [transactionsData, categoriesData, assetsData] = await Promise.all([
          apiFetch<any>(`/transactions?${query.toString()}`, { method: "GET" }, token),
          apiFetch<any>("/categories", { method: "GET" }, token),
          apiFetch<any>("/assets", { method: "GET" }, token),
        ])

        const transactions = Array.isArray(transactionsData.transactions)
          ? transactionsData.transactions
          : []
        const categories = Array.isArray(categoriesData) ? categoriesData : []
        const assets = Array.isArray(assetsData) ? assetsData : []

        const selectedCumulativeStart = new Date(targetYear, 0, 1)
        const selectedTransactions = transactions.filter((t: any) => {
          const date = new Date(t.date)
          return date >= selectedCumulativeStart && date <= endOfMonth
        })

        const incomeTransactions = selectedTransactions.filter((t: any) => t.type === "INCOME")
        const expenseTransactions = selectedTransactions.filter((t: any) => t.type === "EXPENSE")

        const monthlyIncome = incomeTransactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
        const monthlyExpenses = expenseTransactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
        const balance = monthlyIncome - monthlyExpenses

        const totalAssetsValue = assets.reduce((sum: number, asset: any) => sum + Number(asset.currentValue || 0), 0)
        const netWorth = balance + totalAssetsValue

        const recentTransactions = transactions
          .filter((t: any) => {
            const date = new Date(t.date)
            return date >= startOfMonth && date <= endOfMonth
          })
          .slice(0, 5)
          .map((t: any) => ({
            description: t.description,
            amount: Number(t.amount),
            type: (t.type || "EXPENSE").toLowerCase(),
            date: t.date,
          }))

        const categoryIdToName: Record<string, string> = {}
        categories.forEach((category: any) => {
          if (category?.id) {
            categoryIdToName[category.id] = category.name
          }
        })

        const spendingMap = new Map<string, number>()
        expenseTransactions.forEach((transaction: any) => {
          const categoryName = transaction.category?.name || categoryIdToName[transaction.categoryId] || "Other"
          spendingMap.set(categoryName, (spendingMap.get(categoryName) || 0) + Number(transaction.amount))
        })

        const palette = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316", "#84cc16"]
        const spendingCategories = Array.from(spendingMap.entries()).map(([name, value], index) => ({
          name,
          value,
          color: palette[index % palette.length],
        }))

        const allocationMap = new Map<string, number>()
        assets.forEach((asset: any) => {
          const key = asset.type || asset.name
          allocationMap.set(key, (allocationMap.get(key) || 0) + Number(asset.currentValue || 0))
        })
        const assetAllocation = Array.from(allocationMap.entries()).map(([name, value], index) => ({
          name,
          value,
          color: palette[index % palette.length],
        }))

        const series: Array<{ month: string; income: number; expenses: number; balance: number }> = []
        for (let i = monthsBack - 1; i >= 0; i -= 1) {
          const pointDate = new Date(targetYear, targetMonthIndex - i, 1)
          const end = new Date(pointDate.getFullYear(), pointDate.getMonth() + 1, 0)
          const startOfYearForMonth = new Date(pointDate.getFullYear(), 0, 1)
          const monthKey = pointDate.toLocaleString(undefined, { month: "short" })
          const cumulative = transactions.filter((transaction: any) => {
            const date = new Date(transaction.date)
            return date >= startOfYearForMonth && date <= end
          })
          const income = cumulative
            .filter((transaction: any) => transaction.type === "INCOME")
            .reduce((sum: number, transaction: any) => sum + Number(transaction.amount), 0)
          const expenses = cumulative
            .filter((transaction: any) => transaction.type === "EXPENSE")
            .reduce((sum: number, transaction: any) => sum + Number(transaction.amount), 0)
          series.push({ month: monthKey, income, expenses, balance: income - expenses })
        }

        const chartData = {
          incomeExpense: series,
          spendingCategories,
          assetAllocation,
        }

        const assetSummaries = assetAllocation.map((allocation) => ({ name: allocation.name, value: allocation.value, change: 0 }))

        const notifications: DashboardData["notifications"] = []
        if (monthlyExpenses > monthlyIncome * 0.8 && monthlyIncome > 0) {
          notifications.push({
            message: "You're spending more than 80% of your income this month",
            type: "warning",
          })
        }
        if (netWorth < 0) {
          notifications.push({ message: "Your net worth is negative.", type: "warning" })
        }
        if (assetSummaries.length === 0) {
          notifications.push({ message: "Add your first asset to track progress.", type: "info" })
        }

        setData({
          balance,
          netWorth,
          monthlyIncome,
          monthlyExpenses,
          monthlyGoal: 5000,
          assets: assetSummaries,
          rawAssets: assets,
          recentTransactions,
          notifications,
          chartData,
        })
        setLastFetch(now)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    },
    [token, data, lastFetch, selectedYear, selectedMonthIndex]
  )

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    fetchDashboardData(true)
  }, [token, selectedYear, selectedMonthIndex, fetchDashboardData])

  return useMemo(
    () => ({
      data,
      isLoading,
      error,
      refetch: (force = false) => fetchDashboardData(force),
    }),
    [data, isLoading, error, fetchDashboardData]
  )
}
