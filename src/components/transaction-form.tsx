"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus } from "lucide-react"

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
  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toString() || "",
    description: transaction?.description || "",
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    type: transaction?.type || "EXPENSE",
    categoryId: transaction?.categoryId || "",
    subcategory: transaction?.subcategory || "",
    merchant: transaction?.merchant || ""
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCategorizing, setIsCategorizing] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?type=${formData.type}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = transaction ? `/api/transactions/${transaction.id}` : "/api/transactions"
      const method = transaction ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        console.error("Error saving transaction:", error)
      }
    } catch (error) {
      console.error("Error saving transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypeChange = (type: string) => {
    setFormData({ ...formData, type, categoryId: "" })
    fetchCategories()
  }

  const handleAutoCategorize = async () => {
    if (!formData.description || !formData.amount) return

    setIsCategorizing(true)
    try {
      const response = await fetch("/api/transactions/categorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount)
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setFormData(prev => ({
          ...prev,
          subcategory: result.subcategory,
          merchant: result.merchant,
          categoryId: result.categoryId || prev.categoryId
        }))
      }
    } catch (error) {
      console.error("Error categorizing transaction:", error)
    } finally {
      setIsCategorizing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">
              {transaction ? "Edit Transaction" : "Add Transaction"}
            </CardTitle>
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
                <Button
                  type="button"
                  variant={formData.type === "INCOME" ? "default" : "outline"}
                  onClick={() => handleTypeChange("INCOME")}
                  className="flex-1"
                >
                  Income
                </Button>
                <Button
                  type="button"
                  variant={formData.type === "EXPENSE" ? "default" : "outline"}
                  onClick={() => handleTypeChange("EXPENSE")}
                  className="flex-1"
                >
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
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              <p className="text-xs text-gray-400 mt-1">
                Click "AI" to auto-categorize based on description
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Date *</label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
              <select
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Subcategory</label>
              <Input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="Optional subcategory"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Merchant</label>
              <Input
                type="text"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                placeholder="Optional merchant name"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Saving..." : (transaction ? "Update" : "Add")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
