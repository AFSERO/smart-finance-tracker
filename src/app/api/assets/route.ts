import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PriceFetcher } from "@/lib/price-fetcher"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assets = await prisma.asset.findMany({
      where: {
        userId: (session.user as any).id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Optionally refresh gold values on fetch if cache is older than 1 hour
    // This keeps values fresh when user visits assets page
    try {
      // Trigger a background refresh of the cache
      if (typeof (PriceFetcher as any).startHourlyAutoRefresh === 'function') {
        ;(PriceFetcher as any).startHourlyAutoRefresh()
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
    const { name, type, quantity, purchasePrice, purchaseDate, assetData, currentValue: manualCurrentValue } = body

    if (!name || !type || !quantity) {
      return NextResponse.json(
        { error: "Name, type, and quantity are required" },
        { status: 400 }
      )
    }

    // Calculate current value based on asset type
    let currentValue = typeof manualCurrentValue === 'number' ? manualCurrentValue : (purchasePrice || 0)
    
    if (type.toUpperCase() === 'GOLD' && quantity && typeof manualCurrentValue !== 'number') {
      try {
        currentValue = await PriceFetcher.calculateGoldValue(parseFloat(quantity))
      } catch (error) {
        console.error('Failed to fetch gold price:', error)
        // Fall back to purchase price if gold price fetch fails
        currentValue = purchasePrice || 0
      }
    }

    const asset = await prisma.asset.create({
      data: {
        userId: (session.user as any).id,
        name,
        type: type.toUpperCase(),
        quantity: parseFloat(quantity),
        currentValue: parseFloat(currentValue),
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        assetData: assetData || null
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
