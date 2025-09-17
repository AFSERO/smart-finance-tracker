"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AssetForm } from "@/components/asset-form"
import { Navigation } from "@/components/navigation"
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart3
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Asset {
  id: string
  name: string
  type: string
  quantity: number
  currentValue: number
  purchasePrice?: number
  purchaseDate?: string
  createdAt: string
}

export default function AssetsPage() {
  const { data: session } = useSession()
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  useEffect(() => {
    if (session) {
      fetchAssets()
    }
  }, [session])

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/assets")
      if (response.ok) {
        const data = await response.json()
        setAssets(data)
      }
    } catch (error) {
      console.error("Error fetching assets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return

    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setAssets(assets.filter(a => a.id !== id))
      }
    } catch (error) {
      console.error("Error deleting asset:", error)
    }
  }

  const handleFormSuccess = () => {
    fetchAssets()
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "GOLD":
        return "🥇"
      case "STOCK":
        return "📈"
      case "CRYPTO":
        return "₿"
      case "REAL_ESTATE":
        return "🏠"
      default:
        return "💎"
    }
  }

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case "GOLD":
        return "Gold"
      case "STOCK":
        return "Stock"
      case "CRYPTO":
        return "Cryptocurrency"
      case "REAL_ESTATE":
        return "Real Estate"
      case "CUSTOM":
        return "Custom"
      default:
        return type
    }
  }

  const calculateTotalValue = () => {
    return assets.reduce((sum, asset) => sum + (asset.currentValue * (asset.quantity || 0)), 0)
  }

  const calculateTotalGainLoss = () => {
    return assets.reduce((sum, asset) => {
      if (asset.purchasePrice) {
        const totalCurrent = (asset.currentValue || 0) * (asset.quantity || 0)
        const totalPurchase = (asset.purchasePrice || 0) * (asset.quantity || 0)
        const gainLoss = totalCurrent - totalPurchase
        return sum + gainLoss
      }
      return sum
    }, 0)
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p>You need to be signed in to view assets.</p>
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
              <h1 className="text-3xl font-bold text-white">Assets</h1>
              <p className="text-gray-400">Manage your investment portfolio</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="flex items-center bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">{formatCurrency(calculateTotalValue())}</div>
                <p className="text-xs text-muted-foreground">
                  Current portfolio value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">{assets.length}</div>
                <p className="text-xs text-muted-foreground">
                  Different asset types
                </p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gain/Loss</CardTitle>
                {calculateTotalGainLoss() >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-xl lg:text-2xl font-bold ${
                  calculateTotalGainLoss() >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(calculateTotalGainLoss())}
                </div>
                <p className="text-xs text-muted-foreground">
                  Since purchase
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Assets List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Assets</CardTitle>
              <CardDescription>
                {assets.length} assets in your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : assets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No assets found</p>
                  <Button 
                    onClick={() => setShowForm(true)} 
                    className="mt-4"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add your first asset
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-500 font-medium">Asset</th>
                          <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                          <th className="text-left py-3 px-4 text-gray-500 font-medium">Quantity</th>
                          <th className="text-left py-3 px-4 text-gray-500 font-medium">Purchase Date</th>
                          <th className="text-right py-3 px-4 text-gray-500 font-medium">Total Purchase</th>
                          <th className="text-right py-3 px-4 text-gray-500 font-medium">Total Current</th>
                          <th className="text-right py-3 px-4 text-gray-500 font-medium">Gain/Loss</th>
                          <th className="text-center py-3 px-4 text-gray-500 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assets.map((asset) => {
                          const totalCurrent = (asset.currentValue || 0) * (asset.quantity || 0)
                          const totalPurchase = asset.purchasePrice ? (asset.purchasePrice * (asset.quantity || 0)) : null
                          const gainLoss = totalPurchase != null ? (totalCurrent - totalPurchase) : 0
                          const gainLossPercentage = totalPurchase != null && totalPurchase !== 0
                            ? (gainLoss / totalPurchase) * 100
                            : 0

                          return (
                            <tr key={asset.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="text-2xl">
                                    {getAssetIcon(asset.type)}
                                  </div>
                                  <div>
                                    <p className="font-medium">{asset.name}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">{getAssetTypeLabel(asset.type)}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm">{asset.quantity} {asset.type === 'GOLD' ? 'g' : 'units'}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">
                                  {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {asset.purchasePrice ? (
                                  <span className="text-sm">{formatCurrency((asset.purchasePrice || 0) * (asset.quantity || 0))}</span>
                                ) : (
                                  <span className="text-sm text-gray-400">N/A</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <p className="font-medium">{formatCurrency((asset.currentValue || 0) * (asset.quantity || 0))}</p>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {asset.purchasePrice ? (
                                  <div>
                                    <p className={`text-sm font-medium ${
                                      gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                                    </p>
                                    <p className={`text-xs ${
                                      gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      ({gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(1)}%)
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">N/A</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingAsset(asset)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(asset.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {assets.map((asset) => {
                      const totalCurrent = (asset.currentValue || 0) * (asset.quantity || 0)
                      const totalPurchase = asset.purchasePrice ? (asset.purchasePrice * (asset.quantity || 0)) : null
                      const gainLoss = totalPurchase != null ? (totalCurrent - totalPurchase) : 0
                      const gainLossPercentage = totalPurchase != null && totalPurchase !== 0
                        ? (gainLoss / totalPurchase) * 100
                        : 0

                      return (
                        <div
                          key={asset.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">
                                {getAssetIcon(asset.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{asset.name}</p>
                                <p className="text-sm text-gray-500">{getAssetTypeLabel(asset.type)}</p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingAsset(asset)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(asset.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Quantity</span>
                              <span className="text-sm font-medium">{asset.quantity} {asset.type === 'GOLD' ? 'g' : 'units'}</span>
                            </div>
                            {asset.purchasePrice && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Total Purchase</span>
                                <span className="font-medium">{formatCurrency((asset.purchasePrice || 0) * (asset.quantity || 0))}</span>
                              </div>
                            )}
                            {asset.purchaseDate && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Purchase Date</span>
                                <span className="text-sm">{new Date(asset.purchaseDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Total Current</span>
                              <span className="font-medium">{formatCurrency((asset.currentValue || 0) * (asset.quantity || 0))}</span>
                            </div>
                            {asset.purchasePrice && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Gain/Loss</span>
                                <div className="text-right">
                                  <p className={`text-sm font-medium ${
                                    gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                                  </p>
                                  <p className={`text-xs ${
                                    gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    ({gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(1)}%)
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Asset Form Modal */}
      {showForm && (
        <AssetForm
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {editingAsset && (
        <AssetForm
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
