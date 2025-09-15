"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface AssetFormProps {
  onClose: () => void
  onSuccess: () => void
  asset?: any
}

export function AssetForm({ onClose, onSuccess, asset }: AssetFormProps) {
  const [formData, setFormData] = useState({
    name: asset?.name || "",
    type: asset?.type || "GOLD",
    quantity: asset?.quantity?.toString() || "",
    purchasePrice: asset?.purchasePrice?.toString() || "",
    purchaseDate: asset?.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : "",
    currentValue: asset?.currentValue?.toString() || "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const assetTypes = [
    { value: "GOLD", label: "Gold" },
    { value: "STOCK", label: "Stock" },
    { value: "CRYPTO", label: "Cryptocurrency" },
    { value: "REAL_ESTATE", label: "Real Estate" },
    { value: "CUSTOM", label: "Custom" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = asset ? `/api/assets/${asset.id}` : "/api/assets"
      const method = asset ? "PUT" : "POST"

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
        console.error("Error saving asset:", error)
      }
    } catch (error) {
      console.error("Error saving asset:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">
              {asset ? "Edit Asset" : "Add Asset"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {asset ? "Update asset details" : "Enter asset details"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Asset Name *</label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Apple Stock, Bitcoin, Gold Bar"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Asset Type *</label>
              <select
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {assetTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">{formData.type === 'GOLD' ? 'Grams *' : 'Quantity *'}</label>
              <Input
                type="number"
                step="0.00000001"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0.00000000"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            {formData.type !== 'GOLD' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Current Value (Optional)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="0.00"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Purchase Price (Optional)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="0.00"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Purchase Date (Optional)</label>
              <Input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
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
                {isLoading ? "Saving..." : (asset ? "Update" : "Add")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
