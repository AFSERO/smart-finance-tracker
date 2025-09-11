import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Mock AI categorization function
// In a real app, this would use OpenAI API or similar
function categorizeTransaction(description: string, amount: number): {
  category: string
  subcategory: string
  merchant: string
} {
  const desc = description.toLowerCase()
  
  // Food & Dining
  if (desc.includes('starbucks') || desc.includes('coffee') || desc.includes('restaurant') || desc.includes('food')) {
    return { category: 'Food & Dining', subcategory: 'Restaurants', merchant: 'Restaurant' }
  }
  
  // Groceries
  if (desc.includes('grocery') || desc.includes('supermarket') || desc.includes('walmart') || desc.includes('target')) {
    return { category: 'Food & Dining', subcategory: 'Groceries', merchant: 'Grocery Store' }
  }
  
  // Transportation
  if (desc.includes('gas') || desc.includes('fuel') || desc.includes('uber') || desc.includes('lyft') || desc.includes('taxi')) {
    return { category: 'Transportation', subcategory: 'Gas & Fuel', merchant: 'Transportation' }
  }
  
  // Housing
  if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('apartment') || desc.includes('housing')) {
    return { category: 'Housing', subcategory: 'Rent/Mortgage', merchant: 'Housing' }
  }
  
  // Utilities
  if (desc.includes('electric') || desc.includes('water') || desc.includes('internet') || desc.includes('phone') || desc.includes('utility')) {
    return { category: 'Utilities', subcategory: 'Bills', merchant: 'Utility Company' }
  }
  
  // Healthcare
  if (desc.includes('doctor') || desc.includes('hospital') || desc.includes('pharmacy') || desc.includes('medical')) {
    return { category: 'Healthcare', subcategory: 'Medical', merchant: 'Healthcare' }
  }
  
  // Entertainment
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('movie') || desc.includes('entertainment')) {
    return { category: 'Entertainment', subcategory: 'Streaming', merchant: 'Entertainment' }
  }
  
  // Shopping
  if (desc.includes('amazon') || desc.includes('shopping') || desc.includes('store') || desc.includes('retail')) {
    return { category: 'Personal', subcategory: 'Shopping', merchant: 'Retail Store' }
  }
  
  // Income
  if (amount > 0) {
    if (desc.includes('salary') || desc.includes('payroll') || desc.includes('wage')) {
      return { category: 'Salary', subcategory: 'Employment', merchant: 'Employer' }
    }
    if (desc.includes('freelance') || desc.includes('contract') || desc.includes('gig')) {
      return { category: 'Freelance', subcategory: 'Work', merchant: 'Client' }
    }
    if (desc.includes('investment') || desc.includes('dividend') || desc.includes('interest')) {
      return { category: 'Investment', subcategory: 'Returns', merchant: 'Investment' }
    }
  }
  
  // Default categories
  if (amount > 0) {
    return { category: 'Income', subcategory: 'Other', merchant: 'Unknown' }
  } else {
    return { category: 'Personal', subcategory: 'Other', merchant: 'Unknown' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { description, amount } = await request.json()

    if (!description || amount === undefined) {
      return NextResponse.json(
        { error: "Description and amount are required" },
        { status: 400 }
      )
    }

    // Get user's categories
    const categories = await prisma.category.findMany({
      where: { userId: (session.user as any).id }
    })

    // Categorize the transaction
    const categorization = categorizeTransaction(description, amount)
    
    // Find matching category in user's categories
    const matchingCategory = categories.find(cat => 
      cat.name.toLowerCase() === categorization.category.toLowerCase()
    )

    return NextResponse.json({
      category: categorization.category,
      subcategory: categorization.subcategory,
      merchant: categorization.merchant,
      categoryId: matchingCategory?.id || null,
      confidence: 0.85 // Mock confidence score
    })

  } catch (error) {
    console.error("Error categorizing transaction:", error)
    return NextResponse.json(
      { error: "Failed to categorize transaction" },
      { status: 500 }
    )
  }
}
