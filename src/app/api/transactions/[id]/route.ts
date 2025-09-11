import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: (session.user as any).id
      },
      include: {
        category: true
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error fetching transaction:", error)
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
    const { amount, description, date, type, categoryId, subcategory, merchant } = body

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: (session.user as any).id
      }
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    const transaction = await prisma.transaction.update({
      where: {
        id: params.id
      },
      data: {
        amount: amount ? parseFloat(amount) : existingTransaction.amount,
        description: description || existingTransaction.description,
        date: date ? new Date(date) : existingTransaction.date,
        type: type ? type.toUpperCase() : existingTransaction.type,
        categoryId: categoryId || existingTransaction.categoryId,
        subcategory: subcategory || existingTransaction.subcategory,
        merchant: merchant || existingTransaction.merchant
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error updating transaction:", error)
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

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: (session.user as any).id
      }
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    await prisma.transaction.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: "Transaction deleted successfully" })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
