"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionForm } from "@/components/transaction-form"
import { Navigation } from "@/components/navigation"
import { 
  Plus, 
  Filter, 
  Search, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Calendar
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

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
  subcategory?: string
  merchant?: string
  source: string
}

export default function TransactionsPage() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState({
    type: "",
    search: "",
    startDate: "",
    endDate: ""
  })

  useEffect(() => {
    if (session) {
      fetchTransactions()
    }
  }, [session, filters])

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append("type", filters.type)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)

      const response = await fetch(`/api/transactions?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        let filteredTransactions = data.transactions

        if (filters.search) {
          filteredTransactions = filteredTransactions.filter((t: Transaction) =>
            t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            t.merchant?.toLowerCase().includes(filters.search.toLowerCase())
          )
        }

        setTransactions(filteredTransactions)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setTransactions(transactions.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
  }

  const handleFormSuccess = () => {
    fetchTransactions()
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p>You need to be signed in to view transactions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Transactions</h1>
              <p className="text-gray-400">Manage your income and expenses</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="flex items-center bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>

          {/* Filters */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Type</label>
                  <select
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400"
                      placeholder="Search transactions..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Start Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">End Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-gray-400">
                {transactions.length} transactions found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No transactions found</p>
                  <Button 
                    onClick={() => setShowForm(true)} 
                    className="mt-4"
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add your first transaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === "INCOME" 
                            ? "bg-green-900 text-green-400" 
                            : "bg-red-900 text-red-400"
                        }`}>
                          {transaction.type === "INCOME" ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{transaction.description}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(new Date(transaction.date))}</span>
                            {transaction.category && (
                              <>
                                <span>•</span>
                                <span>{transaction.category.icon} {transaction.category.name}</span>
                              </>
                            )}
                            {transaction.merchant && (
                              <>
                                <span>•</span>
                                <span>{transaction.merchant}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${
                          transaction.type === "INCOME" ? "text-green-400" : "text-red-400"
                        }`}>
                          {transaction.type === "INCOME" ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTransaction(transaction)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {editingTransaction && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
