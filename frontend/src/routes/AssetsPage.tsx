import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AssetForm } from "@/components/asset-form"
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { apiFetch } from "@/lib/api"

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

export function AssetsPage() {
  const { token } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  const fetchAssets = useCallback(async () => {
    if (!token) {
      return
    }
    setIsLoading(true)
    try {
      const data = await apiFetch<Asset[]>("/assets", { method: "GET" }, token)
      setAssets(data)
    } catch (error) {
      console.error("Error fetching assets", error)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm("Are you sure you want to delete this asset?")) {
      return
    }
    try {
      await apiFetch(`/assets/${id}`, { method: "DELETE" }, token)
      setAssets((current) => current.filter((asset) => asset.id !== id))
    } catch (error) {
      console.error("Error deleting asset", error)
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

  const totalValue = useMemo(() => assets.reduce((sum, asset) => sum + Number(asset.currentValue || 0), 0), [assets])

  const totalGainLoss = useMemo(() => {
    return assets.reduce((sum, asset) => {
      if (asset.purchasePrice) {
        return sum + (Number(asset.currentValue || 0) - asset.purchasePrice * Number(asset.quantity || 0))
      }
      return sum
    }, 0)
  }, [assets])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Assets</h1>
          <p className="text-gray-400">Manage your investment portfolio</p>
        </div>
        <Button
          onClick={() => {
            setEditingAsset(null)
            setShowForm(true)
          }}
          className="flex items-center bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="bg-gray-800 border border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-gray-500">Current portfolio value</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Assets</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-white">{assets.length}</div>
            <p className="text-xs text-gray-500">Different asset entries</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border border-gray-700 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Gain/Loss</CardTitle>
            {totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-xl lg:text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(totalGainLoss)}
            </div>
            <p className="text-xs text-gray-500">Compared to purchase price</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Asset Inventory</CardTitle>
          <CardDescription className="text-gray-400">Track and update your holdings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">No assets found</p>
              <p className="mt-2 text-sm">Add your assets to start tracking performance.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="border border-gray-700 rounded-lg p-4 bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getAssetIcon(asset.type)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{asset.name}</h3>
                        <p className="text-sm text-gray-400">{getAssetTypeLabel(asset.type)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAsset(asset)
                          setShowForm(true)
                        }}
                        className="border-gray-600 text-white hover:bg-gray-800"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(asset.id)}
                        className="border-gray-600 text-red-400 hover:bg-gray-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Quantity</p>
                      <p className="text-white font-medium">{asset.quantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Current Value</p>
                      <p className="text-white font-medium">{formatCurrency(Number(asset.currentValue || 0))}</p>
                    </div>
                    {asset.purchasePrice && (
                      <div>
                        <p className="text-gray-400">Purchase Price</p>
                        <p className="text-white font-medium">{formatCurrency(Number(asset.purchasePrice) * Number(asset.quantity || 0))}</p>
                      </div>
                    )}
                    {asset.purchaseDate && (
                      <div>
                        <p className="text-gray-400">Purchase Date</p>
                        <p className="text-white font-medium">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <AssetForm
          asset={editingAsset}
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
