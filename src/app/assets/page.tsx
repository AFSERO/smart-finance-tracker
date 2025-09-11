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
    return assets.reduce((sum, asset) => sum + asset.currentValue, 0)
  }

  const calculateTotalGainLoss = () => {
    return assets.reduce((sum, asset) => {
      if (asset.purchasePrice) {
        const gainLoss = asset.currentValue - (asset.purchasePrice * asset.quantity)
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(calculateTotalValue())}</div>
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
                <div className="text-2xl font-bold">{assets.length}</div>
                <p className="text-xs text-muted-foreground">
                  Different asset types
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gain/Loss</CardTitle>
                {calculateTotalGainLoss() >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
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
                <div className="space-y-4">
                  {assets.map((asset) => {
                    const gainLoss = asset.purchasePrice 
                      ? asset.currentValue - (asset.purchasePrice * asset.quantity)
                      : 0
                    const gainLossPercentage = asset.purchasePrice 
                      ? (gainLoss / (asset.purchasePrice * asset.quantity)) * 100
                      : 0

                    return (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">
                            {getAssetIcon(asset.type)}
                          </div>
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{getAssetTypeLabel(asset.type)}</span>
                              <span>•</span>
                              <span>{asset.quantity} units</span>
                              {asset.purchaseDate && (
                                <>
                                  <span>•</span>
                                  <span>Purchased {new Date(asset.purchaseDate).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(asset.currentValue)}</p>
                            {asset.purchasePrice && (
                              <p className={`text-sm ${
                                gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)} 
                                ({gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(1)}%)
                              </p>
                            )}
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
                      </div>
                    )
                  })}
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
