import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionForm } from "@/components/transaction-form"
import {
  Plus,
  Filter,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { apiFetch } from "@/lib/api"

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  type: "INCOME" | "EXPENSE"
  category?: {
    id: string
    name: string
    icon?: string
    color?: string
  }
  categoryId?: string
  subcategory?: string
  merchant?: string
  source: string
}

export function TransactionsPage() {
  const { token } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState({ type: "", search: "", startDate: "", endDate: "" })

  const fetchTransactions = useCallback(async () => {
    if (!token) {
      return
    }
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append("type", filters.type)
      if (filters.startDate) params.append("start_date", filters.startDate)
      if (filters.endDate) params.append("end_date", filters.endDate)
      params.append("limit", "100")

      const response = await apiFetch<{ transactions: Transaction[] }>(
        `/transactions?${params.toString()}`,
        { method: "GET" },
        token
      )

      let items = response.transactions || []
      if (filters.search) {
        const query = filters.search.toLowerCase()
        items = items.filter((transaction) => {
          const matchesDescription = transaction.description.toLowerCase().includes(query)
          const matchesMerchant = transaction.merchant?.toLowerCase().includes(query)
          return matchesDescription || matchesMerchant
        })
      }

      setTransactions(items)
    } catch (error) {
      console.error("Error fetching transactions", error)
    } finally {
      setIsLoading(false)
    }
  }, [token, filters])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm("Are you sure you want to delete this transaction?")) {
      return
    }
    try {
      await apiFetch(`/transactions/${id}`, { method: "DELETE" }, token)
      setTransactions((current) => current.filter((transaction) => transaction.id !== id))
    } catch (error) {
      console.error("Error deleting transaction", error)
    }
  }

  const handleFormSuccess = () => {
    fetchTransactions()
  }

  const incomeTotal = useMemo(
    () => transactions.filter((txn) => txn.type === "INCOME").reduce((total, txn) => total + Number(txn.amount), 0),
    [transactions]
  )
  const expenseTotal = useMemo(
    () => transactions.filter((txn) => txn.type === "EXPENSE").reduce((total, txn) => total + Number(txn.amount), 0),
    [transactions]
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400">Manage your income and expenses</p>
        </div>
        <Button
          onClick={() => {
            setEditingTransaction(null)
            setShowForm(true)
          }}
          className="flex items-center bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Type</label>
              <select
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                value={filters.type}
                onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
              >
                <option value="">All</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Start Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                value={filters.startDate}
                onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">End Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                value={filters.endDate}
                onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-gray-400">{transactions.length} transactions found</CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center text-green-400">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span>{formatCurrency(incomeTotal)}</span>
              </div>
              <div className="flex items-center text-red-400">
                <TrendingDown className="w-4 h-4 mr-2" />
                <span>{formatCurrency(expenseTotal)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">No transactions found</p>
              <p className="mt-2 text-sm">Add your first transaction to see it here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{transaction.description}</div>
                        {transaction.merchant && <div className="text-sm text-gray-400">{transaction.merchant}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{transaction.category?.name || "Uncategorized"}</div>
                        {transaction.subcategory && <div className="text-xs text-gray-500">{transaction.subcategory}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          {formatDate(transaction.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={transaction.type === "INCOME" ? "text-green-400" : "text-red-400"}>
                          {transaction.type === "INCOME" ? "" : "-"}
                          {formatCurrency(Number(transaction.amount))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTransaction(transaction)
                            setShowForm(true)
                          }}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="border-gray-600 text-red-400 hover:bg-gray-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
