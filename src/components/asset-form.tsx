"use client"

import { useEffect, useState } from "react"
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
    { value: "GOLD", label: "Gold (XAU)" },
    { value: "CURRENCY_USD", label: "Currency - USD" },
    { value: "CURRENCY_EUR", label: "Currency - EUR" },
    { value: "CURRENCY_TRY", label: "Currency - TRY" },
    { value: "HOUSE", label: "House" },
    { value: "CAR", label: "Car" },
    { value: "OTHER", label: "Other" },
  ]

  const isAutoType = (t: string) => t === 'GOLD' || t === 'CURRENCY_USD' || t === 'CURRENCY_EUR' || t === 'CURRENCY_TRY'

  useEffect(() => {
    let cancelled = false
    async function loadRate() {
      if (!isAutoType(formData.type)) return
      try {
        const res = await fetch('/api/rates', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json() as Record<string, number>
        const key = formData.type === 'GOLD' ? 'XAU' : (formData.type === 'CURRENCY_USD' ? 'USD' : formData.type === 'CURRENCY_EUR' ? 'EUR' : 'TRY')
        const val = data[key]
        if (!cancelled && typeof val === 'number' && Number.isFinite(val)) {
          setFormData(prev => ({ ...prev, currentValue: String(val) }))
        }
      } catch {}
    }
    loadRate()
    return () => { cancelled = true }
  }, [formData.type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = asset ? `/api/assets/${asset.id}` : "/api/assets"
      const method = asset ? "PUT" : "POST"
      // Prepare payload with numbers, leaving optional fields undefined when empty
      const quantityNum = formData.quantity !== "" ? parseFloat(formData.quantity) : undefined
      const purchasePriceNum = formData.purchasePrice !== "" ? parseFloat(formData.purchasePrice) : undefined
      const currentValueNum = formData.currentValue !== "" ? parseFloat(formData.currentValue) : undefined

      const payload = {
        name: formData.name,
        type: ((): string => {
          if (formData.type === 'GOLD') return 'GOLD'
          if (formData.type === 'CURRENCY_USD' || formData.type === 'CURRENCY_EUR' || formData.type === 'CURRENCY_TRY') return 'CURRENCY'
          if (formData.type === 'HOUSE') return 'REAL_ESTATE'
          if (formData.type === 'CAR') return 'CUSTOM'
          if (formData.type === 'OTHER') return 'CUSTOM'
          return formData.type
        })(),
        quantity: quantityNum,
        purchasePrice: purchasePriceNum,
        purchaseDate: formData.purchaseDate || undefined,
        currentValue: currentValueNum,
        assetData: ((): any => {
          if (formData.type === 'CURRENCY_USD') return { currencyCode: 'USD' }
          if (formData.type === 'CURRENCY_EUR') return { currencyCode: 'EUR' }
          if (formData.type === 'CURRENCY_TRY') return { currencyCode: 'TRY' }
          return undefined
        })()
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Current Unit Price {isAutoType(formData.type) ? '(Auto)' : '(Manual)'}{isAutoType(formData.type) ? '' : ' (Optional)'} </label>
              <Input
                type="number"
                step="0.01"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                placeholder="0.00"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:opacity-60"
                disabled={isAutoType(formData.type)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Purchase Unit Price (Optional)</label>
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
