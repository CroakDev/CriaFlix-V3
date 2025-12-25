import { PrismaClient } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

const prisma = new PrismaClient()

// GET - Get user subscription status
export async function GET() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        isVip: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        subscriptionRenewable: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if subscription has expired
    const now = new Date()
    if (user.subscriptionEndDate && user.subscriptionEndDate < now && user.subscriptionStatus === "active") {
      // Auto-update expired subscriptions
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          subscriptionStatus: "expired",
          isVip: false,
        },
      })

      return NextResponse.json({
        ...user,
        subscriptionStatus: "expired",
        isVip: false,
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching subscription info:", error)
    return NextResponse.json({ error: "Failed to fetch subscription info" }, { status: 500 })
  }
}

// POST - Create/Update subscription
export async function POST(request: NextRequest) {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { plan, action } = body // action: "subscribe" | "renew" | "cancel"

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (action === "subscribe" || action === "renew") {
      // Calculate end date based on plan
      const startDate = new Date()
      const endDate = new Date()

      switch (plan) {
        case "monthly":
          endDate.setMonth(endDate.getMonth() + 1)
          break
        case "quarterly":
          endDate.setMonth(endDate.getMonth() + 3)
          break
        case "yearly":
          endDate.setFullYear(endDate.getFullYear() + 1)
          break
        default:
          return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
      }

      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          isVip: true,
          subscriptionPlan: plan,
          subscriptionStatus: "active",
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
          subscriptionRenewable: true,
        },
      })

      return NextResponse.json({
        message: "Subscription activated successfully",
        subscription: {
          isVip: updatedUser.isVip,
          subscriptionPlan: updatedUser.subscriptionPlan,
          subscriptionStatus: updatedUser.subscriptionStatus,
          subscriptionStartDate: updatedUser.subscriptionStartDate,
          subscriptionEndDate: updatedUser.subscriptionEndDate,
        },
      })
    }

    if (action === "cancel") {
      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          subscriptionRenewable: false,
          subscriptionStatus: "cancelled",
        },
      })

      return NextResponse.json({
        message: "Subscription cancelled. You can still use premium features until the end date",
        subscription: {
          subscriptionStatus: updatedUser.subscriptionStatus,
          subscriptionRenewable: updatedUser.subscriptionRenewable,
        },
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error managing subscription:", error)
    return NextResponse.json({ error: "Failed to manage subscription" }, { status: 500 })
  }
}
