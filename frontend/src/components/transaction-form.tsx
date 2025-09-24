import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { apiFetch } from "@/lib/api"

interface Category {
  id: string
  name: string
  type: string
  icon?: string
  color?: string
}

interface TransactionFormProps {
  onClose: () => void
  onSuccess: () => void
  transaction?: any
}

export function TransactionForm({ onClose, onSuccess, transaction }: TransactionFormProps) {
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toString() || "",
    description: transaction?.description || "",
    date: transaction?.date ? new Date(transaction.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    type: transaction?.type || "EXPENSE",
    categoryId: transaction?.categoryId || "",
    subcategory: transaction?.subcategory || "",
    merchant: transaction?.merchant || "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCategorizing, setIsCategorizing] = useState(false)

  const fetchCategories = useCallback(
    async (currentType: string) => {
      if (!token) {
        return
      }
      try {
        const data = await apiFetch<Category[]>(`/categories?type=${currentType}`, { method: "GET" }, token)
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories", error)
      }
    },
    [token]
  )

  useEffect(() => {
    if (token) {
      fetchCategories(formData.type)
    }
  }, [formData.type, fetchCategories, token])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }
    setIsLoading(true)

    try {
      const url = transaction ? `/transactions/${transaction.id}` : "/transactions"
      const method = transaction ? "PUT" : "POST"

      await apiFetch(url, {
        method,
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      }, token)

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving transaction", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypeChange = (type: string) => {
    setFormData((prev) => ({ ...prev, type, categoryId: "" }))
  }

  const handleAutoCategorize = async () => {
    if (!token || !formData.description || !formData.amount) {
      return
    }
    setIsCategorizing(true)
    try {
      const result = await apiFetch<any>(
        "/transactions/categorize",
        {
          method: "POST",
          body: JSON.stringify({
            description: formData.description,
            amount: Number(formData.amount),
          }),
        },
        token
      )

      setFormData((prev) => ({
        ...prev,
        subcategory: result.subcategory,
        merchant: result.merchant,
        categoryId: result.categoryId || prev.categoryId,
      }))
    } catch (error) {
      console.error("Error categorizing transaction", error)
    } finally {
      setIsCategorizing(false)
    }
  }

  const categoryOptions = useMemo(() => categories.filter((category) => category.type === formData.type), [categories, formData.type])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">{transaction ? "Edit Transaction" : "Add Transaction"}</CardTitle>
            <CardDescription className="text-gray-400">
              {transaction ? "Update transaction details" : "Enter transaction details"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Type</label>
              <div className="flex space-x-2">
                <Button type="button" variant={formData.type === "INCOME" ? "default" : "outline"} onClick={() => handleTypeChange("INCOME")} className="flex-1">
                  Income
                </Button>
                <Button type="button" variant={formData.type === "EXPENSE" ? "default" : "outline"} onClick={() => handleTypeChange("EXPENSE")} className="flex-1">
                  Expense
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Amount *</label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(event) => setFormData({ ...formData, amount: event.target.value })}
                placeholder="0.00"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Description *</label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  placeholder="Enter description"
                  className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAutoCategorize}
                  disabled={isCategorizing || !formData.description || !formData.amount}
                  className="px-3"
                >
                  {isCategorizing ? "..." : "AI"}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Click "AI" to auto-categorize based on description</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Date *</label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
              <select
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                value={formData.categoryId}
                onChange={(event) => setFormData({ ...formData, categoryId: event.target.value })}
              >
                <option value="">Select category</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Subcategory</label>
                <Input
                  type="text"
                  value={formData.subcategory}
                  onChange={(event) => setFormData({ ...formData, subcategory: event.target.value })}
                  placeholder="e.g. Groceries"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Merchant</label>
                <Input
                  type="text"
                  value={formData.merchant}
                  onChange={(event) => setFormData({ ...formData, merchant: event.target.value })}
                  placeholder="e.g. Walmart"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose} className="border-gray-600 text-white hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                {transaction ? "Update" : "Add"}{isLoading ? "..." : ""}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
