import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PriceFetcher } from "@/lib/price-fetcher"
import { getRate } from "@/services/ratesService"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let assets = await prisma.asset.findMany({
      where: {
        userId: (session.user as any).id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Auto-refresh GOLD current values unless manually overridden
    try {
      const goldAssets = assets.filter(a => a.type === 'GOLD' && !(a as any).assetData?.manualOverrideCurrentValue)
      if (goldAssets.length > 0) {
        const price = await PriceFetcher.getGoldPrice()
        await Promise.all(goldAssets.map(a =>
          prisma.asset.update({
            where: { id: a.id },
            data: { currentValue: a.quantity * price }
          })
        ))
        // Re-fetch to return latest values
        assets = await prisma.asset.findMany({
          where: { userId: (session.user as any).id },
          orderBy: { createdAt: 'desc' }
        })
      }
    } catch {}

    return NextResponse.json(assets)
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      type,
      quantity,
      purchasePrice,
      purchaseDate,
      assetData,
      currentValue: manualCurrentValue,
    } = body

    if (!name || !type || !quantity) {
      return NextResponse.json(
        { error: "Name, type, and quantity are required" },
        { status: 400 }
      )
    }

    // Ensure numeric parsing for inputs provided as strings
    const parsedQuantity = typeof quantity === 'number' ? quantity : parseFloat(String(quantity))
    const parsedPurchasePrice = typeof purchasePrice === 'number' ? purchasePrice : (purchasePrice != null && String(purchasePrice) !== '' ? parseFloat(String(purchasePrice)) : undefined)
    const parsedManualCurrent = typeof manualCurrentValue === 'number' ? manualCurrentValue : (manualCurrentValue != null && String(manualCurrentValue) !== '' ? parseFloat(String(manualCurrentValue)) : undefined)

    // Determine unit current price: respect manual override if provided, otherwise use integration when available
    let currentUnitPrice: number
    if (typeof parsedManualCurrent === 'number' && !Number.isNaN(parsedManualCurrent)) {
      currentUnitPrice = parsedManualCurrent
    } else if (type.toUpperCase() === 'GOLD') {
      try {
        // Prefer Python microservice if available, fallback to previous fetcher
        const xau = await getRate('XAU')
        currentUnitPrice = (xau != null ? xau : await PriceFetcher.getGoldPrice())
      } catch (error) {
        console.error('Failed to fetch gold price:', error)
        currentUnitPrice = 0
      }
    } else if (type.toUpperCase() === 'CURRENCY') {
      // Expect currencyCode in assetData
      const code = (assetData && assetData.currencyCode) || (typeof body.currencyCode === 'string' ? body.currencyCode : null)
      if (code) {
        const upper = String(code).toUpperCase()
        if (upper === 'USD' || upper === 'EUR' || upper === 'TRY') {
          const value = await getRate(upper as 'USD' | 'EUR' | 'TRY')
          currentUnitPrice = value != null ? value : 0
        } else {
          currentUnitPrice = 0
        }
      } else {
        currentUnitPrice = 0
      }
    } else {
      // No manual value and no integration: default to 0
      currentUnitPrice = 0
    }

    const asset = await prisma.asset.create({
      data: {
        userId: (session.user as any).id,
        name,
        type: type.toUpperCase(),
        quantity: parsedQuantity,
        currentValue: currentUnitPrice,
        purchasePrice: typeof parsedPurchasePrice === 'number' ? parsedPurchasePrice : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        assetData: ((): any => {
          const base = (assetData && typeof assetData === 'object') ? assetData : {}
          if (typeof parsedManualCurrent === 'number' && !Number.isNaN(parsedManualCurrent)) {
            return { ...base, manualOverrideCurrentValue: true }
          }
          return { ...base, manualOverrideCurrentValue: false }
        })()
      }
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error("Error creating asset:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
