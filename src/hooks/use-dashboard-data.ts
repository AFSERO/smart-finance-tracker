"use client"

import { useState, useEffect } from "react"

interface DashboardData {
  balance: number
  netWorth: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyGoal: number
  assets: Array<{
    name: string
    value: number
    change: number
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
    incomeExpense: Array<{
      month: string
      income: number
      expenses: number
      balance: number
    }>
    spendingCategories: Array<{
      name: string
      value: number
      color: string
    }>
    assetAllocation: Array<{
      name: string
      value: number
      color: string
    }>
  }
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async (forceRefresh = false) => {
    // Simple cache: don't refetch if data is less than 30 seconds old unless forced
    const now = Date.now()
    if (!forceRefresh && data && (now - lastFetch) < 30000) {
      return
    }
    try {
      setIsLoading(true)
      setError(null)

      // Fetch transactions for the current month
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const [transactionsResponse, categoriesResponse, assetsResponse] = await Promise.all([
        fetch(`/api/transactions?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`),
        fetch("/api/categories"),
        fetch("/api/assets")
      ])

      if (!transactionsResponse.ok || !categoriesResponse.ok || !assetsResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const transactionsData = await transactionsResponse.json()
      const categoriesData = await categoriesResponse.json()
      const assetsData = await assetsResponse.json()

      // Calculate metrics
      const transactions = transactionsData.transactions || []
      const incomeTransactions = transactions.filter((t: any) => t.type === "INCOME")
      const expenseTransactions = transactions.filter((t: any) => t.type === "EXPENSE")

      const monthlyIncome = incomeTransactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)
      const monthlyExpenses = expenseTransactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)
      const balance = monthlyIncome - monthlyExpenses

      // Assets
      const assets = Array.isArray(assetsData) ? assetsData : []
      const totalAssetsValue = assets.reduce((sum: number, a: any) => sum + (parseFloat(a.currentValue) || 0), 0)
      const netWorth = balance + totalAssetsValue // Net worth = current balance + total assets value

      // Get recent transactions (last 5)
      const recentTransactions = transactions
        .slice(0, 5)
        .map((t: any) => ({
          description: t.description,
          amount: parseFloat(t.amount),
          type: t.type.toLowerCase(),
          date: t.date
        }))

      // Group expenses by category for spending categories chart
      const categoryIdToName: Record<string, string> = {}
      categoriesData.forEach((c: any) => { if (c?.id) categoryIdToName[c.id] = c.name })
      const spendingMap = new Map<string, number>()
      expenseTransactions.forEach((t: any) => {
        const name = (t.category?.name) || (t.categoryId ? categoryIdToName[t.categoryId] : "Other") || "Other"
        const prev = spendingMap.get(name) || 0
        spendingMap.set(name, prev + parseFloat(t.amount))
      })
      const palette = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316", "#84cc16"]
      const spendingCategories = Array.from(spendingMap.entries()).map(([name, value], idx) => ({
        name,
        value,
        color: palette[idx % palette.length]
      }))

      // Asset allocation by type/name
      const allocationMap = new Map<string, number>()
      assets.forEach((a: any) => {
        const key = a.type || a.name
        const prev = allocationMap.get(key) || 0
        allocationMap.set(key, prev + (parseFloat(a.currentValue) || 0))
      })
      const assetAllocation = Array.from(allocationMap.entries()).map(([name, value], idx) => ({
        name,
        value,
        color: palette[idx % palette.length]
      }))

      // Income/Expense over last 6 months
      const monthsBack = 6
      const series: Array<{ month: string; income: number; expenses: number; balance: number }> = []
      for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const start = new Date(d.getFullYear(), d.getMonth(), 1)
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
        const monthKey = d.toLocaleString(undefined, { month: 'short' })
        const monthly = transactions.filter((t: any) => {
          const td = new Date(t.date)
          return td >= start && td <= end
        })
        const inc = monthly.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + parseFloat(t.amount), 0)
        const exp = monthly.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + parseFloat(t.amount), 0)
        series.push({ month: monthKey, income: inc, expenses: exp, balance: inc - exp })
      }

      const chartData = {
        incomeExpense: series,
        spendingCategories,
        assetAllocation
      }

      // Build assets summary for top-list
      const assetSummaries = assetAllocation.map(a => ({ name: a.name, value: a.value, change: 0 }))

      // Generate dynamic notifications based on actual data
      const notifications = []
      
      if (monthlyExpenses > monthlyIncome * 0.8 && monthlyIncome > 0) {
        notifications.push({
          message: "You're spending more than 80% of your income this month",
          type: "warning" as const
        })
      }
      
      const monthlyGoal = 5000 // This will be made dynamic in the future
      if (monthlyIncome >= monthlyGoal) {
        notifications.push({
          message: "You've reached your monthly income goal! 🎉",
          type: "success" as const
        })
      }
      
      if (monthlyIncome === 0 && monthlyExpenses === 0) {
        notifications.push({
          message: "Welcome! Add some transactions to get started tracking your finances.",
          type: "info" as const
        })
      }
      
      if (balance < 0) {
        notifications.push({
          message: "You're spending more than you're earning this month",
          type: "warning" as const
        })
      }

      const dashboardData: DashboardData = {
        balance,
        netWorth,
        monthlyIncome,
        monthlyExpenses,
        monthlyGoal: 5000, // placeholder goal until settings provide one
        assets: assetSummaries,
        recentTransactions,
        notifications,
        chartData
      }

      setData(dashboardData)
      setLastFetch(now)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = () => fetchDashboardData(true)

  return { data, isLoading, error, refetch }
}
