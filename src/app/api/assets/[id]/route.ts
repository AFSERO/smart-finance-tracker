import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PriceFetcher } from "@/lib/price-fetcher"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const asset = await prisma.asset.findFirst({
      where: {
        id: params.id,
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, quantity, currentValue, purchasePrice, purchaseDate, assetData } = body

    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        userId: (session.user as any).id
      }
    })

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Calculate current value for gold assets
    let finalCurrentValue = typeof currentValue === 'number' ? currentValue : existingAsset.currentValue
    const finalType = type ?? existingAsset.type
    const finalQuantity = typeof quantity === 'number' ? quantity : existingAsset.quantity

    if (finalType === 'GOLD' && finalQuantity && typeof currentValue !== 'number') {
      try {
        finalCurrentValue = await PriceFetcher.calculateGoldValue(finalQuantity)
      } catch (error) {
        console.error('Failed to fetch gold price for update:', error)
        // Keep existing value if gold price fetch fails
      }
    }

    const asset = await prisma.asset.update({
      where: {
        id: params.id
      },
      data: {
        name: name ?? existingAsset.name,
        type: finalType,
        quantity: finalQuantity,
        currentValue: finalCurrentValue,
        purchasePrice: typeof purchasePrice === 'number' ? purchasePrice : existingAsset.purchasePrice,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : existingAsset.purchaseDate,
        assetData: typeof assetData !== 'undefined' ? assetData : existingAsset.assetData
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
