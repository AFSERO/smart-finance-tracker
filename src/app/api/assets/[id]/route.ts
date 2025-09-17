import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PriceFetcher } from "@/lib/price-fetcher"
import { getRate } from "@/services/ratesService"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = 'then' in (context as any).params
      ? await (context as any).params
      : (context as any).params

    const asset = await prisma.asset.findFirst({
      where: {
        id: resolvedParams.id,
        userId: (session.user as any).id
      }
    })

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error("Error fetching asset:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, quantity, currentValue, purchasePrice, purchaseDate, assetData } = body

    const resolvedParams = 'then' in (context as any).params
      ? await (context as any).params
      : (context as any).params

    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: resolvedParams.id,
        userId: (session.user as any).id
      }
    })

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Parse inputs and respect manual override
    const parsedQuantity = typeof quantity === 'number' ? quantity : (quantity != null && String(quantity) !== '' ? parseFloat(String(quantity)) : undefined)
    const parsedPurchasePrice = typeof purchasePrice === 'number' ? purchasePrice : (purchasePrice != null && String(purchasePrice) !== '' ? parseFloat(String(purchasePrice)) : undefined)
    const parsedManualCurrent = typeof currentValue === 'number' ? currentValue : (currentValue != null && String(currentValue) !== '' ? parseFloat(String(currentValue)) : undefined)

    const finalType = (type ?? existingAsset.type).toUpperCase()
    const finalQuantity = typeof parsedQuantity === 'number' && !Number.isNaN(parsedQuantity) ? parsedQuantity : existingAsset.quantity

    // Compute final unit current price
    let finalCurrentValue: number = existingAsset.currentValue
    if (typeof parsedManualCurrent === 'number' && !Number.isNaN(parsedManualCurrent)) {
      finalCurrentValue = parsedManualCurrent
    } else if (finalType === 'GOLD' && !(existingAsset as any).assetData?.manualOverrideCurrentValue) {
      try {
        // Fetch unit price for GOLD (prefer microservice)
        const xau = await getRate('XAU')
        finalCurrentValue = (xau != null ? xau : await PriceFetcher.getGoldPrice())
      } catch (error) {
        console.error('Failed to fetch gold price for update:', error)
        finalCurrentValue = existingAsset.currentValue
      }
    } else if (finalType === 'CURRENCY' && !(existingAsset as any).assetData?.manualOverrideCurrentValue) {
      const code = (existingAsset as any).assetData?.currencyCode
      if (code) {
        const upper = String(code).toUpperCase()
        if (upper === 'USD' || upper === 'EUR' || upper === 'TRY') {
          const value = await getRate(upper as 'USD' | 'EUR' | 'TRY')
          if (value != null) finalCurrentValue = value
        }
      }
    }

    const asset = await prisma.asset.update({
      where: {
        id: resolvedParams.id
      },
      data: {
        name: name ?? existingAsset.name,
        type: finalType,
        quantity: finalQuantity,
        currentValue: finalCurrentValue,
        purchasePrice: typeof parsedPurchasePrice === 'number' ? parsedPurchasePrice : existingAsset.purchasePrice,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : existingAsset.purchaseDate,
        assetData: ((): any => {
          const base = typeof assetData !== 'undefined' ? assetData : existingAsset.assetData || {}
          if (typeof parsedManualCurrent === 'number' && !Number.isNaN(parsedManualCurrent)) {
            return { ...base, manualOverrideCurrentValue: true }
          }
          // If user explicitly clears currentValue (undefined) we do not flip manual flag here
          return base
        })()
      }
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error("Error updating asset:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        userId: (session.user as any).id
      }
    })

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    await prisma.asset.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: "Asset deleted successfully" })
  } catch (error) {
    console.error("Error deleting asset:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
