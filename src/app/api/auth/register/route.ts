import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      }
    })

    // Create default categories
    const defaultCategories = [
      { name: "Housing", type: "EXPENSE", icon: "🏠", color: "#3B82F6" },
      { name: "Transportation", type: "EXPENSE", icon: "🚗", color: "#10B981" },
      { name: "Food & Dining", type: "EXPENSE", icon: "🍽️", color: "#F59E0B" },
      { name: "Entertainment", type: "EXPENSE", icon: "🎬", color: "#8B5CF6" },
      { name: "Utilities", type: "EXPENSE", icon: "⚡", color: "#EF4444" },
      { name: "Healthcare", type: "EXPENSE", icon: "🏥", color: "#06B6D4" },
      { name: "Personal", type: "EXPENSE", icon: "👤", color: "#84CC16" },
      { name: "Salary", type: "INCOME", icon: "💰", color: "#22C55E" },
      { name: "Freelance", type: "INCOME", icon: "💼", color: "#22C55E" },
      { name: "Investment", type: "INCOME", icon: "📈", color: "#22C55E" },
    ]

    await prisma.category.createMany({
      data: defaultCategories.map(category => ({
        ...category,
        userId: user.id
      }))
    })

    // Create default goal
    await prisma.goal.create({
      data: {
        userId: user.id,
        name: "Monthly Income Goal",
        type: "MONTHLY_INCOME",
        targetAmount: 5000,
        currentAmount: 0,
      }
    })

    return NextResponse.json({ 
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
