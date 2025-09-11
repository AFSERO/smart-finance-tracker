import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 })
    }

    // For now, we'll simulate PDF processing
    // In a real implementation, you would:
    // 1. Parse the PDF using a library like pdf-parse
    // 2. Extract transaction data using regex or AI
    // 3. Categorize transactions using AI
    // 4. Save to database

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock transaction data (in real app, this would come from PDF parsing)
    const mockTransactions = [
      {
        amount: -45.67,
        description: "STARBUCKS COFFEE #1234",
        date: new Date(),
        type: "EXPENSE" as const,
        categoryId: null,
        subcategory: "Food & Drinks",
        merchant: "Starbucks",
        source: "PDF_UPLOAD" as const
      },
      {
        amount: -1200.00,
        description: "RENT PAYMENT - APARTMENT",
        date: new Date(),
        type: "EXPENSE" as const,
        categoryId: null,
        subcategory: "Housing",
        merchant: "Landlord",
        source: "PDF_UPLOAD" as const
      },
      {
        amount: 3500.00,
        description: "SALARY DEPOSIT",
        date: new Date(),
        type: "INCOME" as const,
        categoryId: null,
        subcategory: "Salary",
        merchant: "Employer",
        source: "PDF_UPLOAD" as const
      },
      {
        amount: -89.99,
        description: "AMAZON.COM PURCHASE",
        date: new Date(),
        type: "EXPENSE" as const,
        categoryId: null,
        subcategory: "Shopping",
        merchant: "Amazon",
        source: "PDF_UPLOAD" as const
      }
    ]

    // Save mock transactions to database
    const createdTransactions = []
    for (const transaction of mockTransactions) {
      const created = await prisma.transaction.create({
        data: {
          userId: (session.user as any).id,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date,
          type: transaction.type,
          categoryId: transaction.categoryId,
          subcategory: transaction.subcategory,
          merchant: transaction.merchant,
          source: transaction.source
        }
      })
      createdTransactions.push(created)
    }

    return NextResponse.json({
      message: "PDF processed successfully",
      transactionsCount: createdTransactions.length,
      transactions: createdTransactions
    })

  } catch (error) {
    console.error("Error processing PDF:", error)
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    )
  }
}
