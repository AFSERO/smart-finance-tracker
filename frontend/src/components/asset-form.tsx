import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { apiFetch } from "@/lib/api"

interface AssetFormProps {
  onClose: () => void
  onSuccess: () => void
  asset?: any
}

export function AssetForm({ onClose, onSuccess, asset }: AssetFormProps) {
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    name: asset?.name || "",
    type: asset?.type || "GOLD",
    quantity: asset?.quantity?.toString() || "",
    purchasePrice: asset?.purchasePrice?.toString() || "",
    purchaseDate: asset?.purchaseDate ? new Date(asset.purchaseDate).toISOString().split("T")[0] : "",
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }
    setIsLoading(true)

    try {
      const url = asset ? `/assets/${asset.id}` : "/assets"
      const method = asset ? "PUT" : "POST"

      await apiFetch(url, {
        method,
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
          purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
          currentValue: formData.currentValue ? Number(formData.currentValue) : undefined,
          purchaseDate: formData.purchaseDate || undefined,
        }),
      }, token)

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving asset", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">{asset ? "Edit Asset" : "Add Asset"}</CardTitle>
            <CardDescription className="text-gray-400">{asset ? "Update asset details" : "Enter asset details"}</CardDescription>
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
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="e.g., Apple Stock, Bitcoin, Gold Bar"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Asset Type *</label>
              <select
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                value={formData.type}
                onChange={(event) => setFormData({ ...formData, type: event.target.value })}
              >
                {assetTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                {formData.type === "GOLD" ? "Grams *" : "Quantity *"}
              </label>
              <Input
                type="number"
                step="0.00000001"
                required
                value={formData.quantity}
                onChange={(event) => setFormData({ ...formData, quantity: event.target.value })}
                placeholder="0.00000000"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            {formData.type !== "GOLD" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Current Value (Optional)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.currentValue}
                  onChange={(event) => setFormData({ ...formData, currentValue: event.target.value })}
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
                onChange={(event) => setFormData({ ...formData, purchasePrice: event.target.value })}
                placeholder="0.00"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Purchase Date (Optional)</label>
              <Input
                type="date"
                value={formData.purchaseDate}
                onChange={(event) => setFormData({ ...formData, purchaseDate: event.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : asset ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
