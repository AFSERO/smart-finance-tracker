import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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
    const { name, type, quantity, purchasePrice, purchaseDate, assetData } = body

    if (!name || !type || !quantity) {
      return NextResponse.json(
        { error: "Name, type, and quantity are required" },
        { status: 400 }
      )
    }

    // For now, we'll set currentValue to purchasePrice or 0
    // In a real app, this would fetch real-time prices
    const currentValue = purchasePrice || 0

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
