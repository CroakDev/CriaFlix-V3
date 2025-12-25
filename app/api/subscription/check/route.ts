import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

const prisma = new PrismaClient()

// GET - Check if user has active subscription (for blocking content)
export async function GET() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json({ hasAccess: false, reason: "not_authenticated" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        isVip: true,
        isAdmin: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    })

    if (!user) {
      return NextResponse.json({ hasAccess: false, reason: "user_not_found" }, { status: 404 })
    }

    // Admins always have access
    if (user.isAdmin) {
      return NextResponse.json({ hasAccess: true, reason: "admin" })
    }

    // Check if subscription is active and not expired
    const now = new Date()
    const isExpired = user.subscriptionEndDate && user.subscriptionEndDate < now
    const hasActiveSubscription = user.isVip && user.subscriptionStatus === "active" && !isExpired

    if (hasActiveSubscription) {
      return NextResponse.json({
        hasAccess: true,
        reason: "active_subscription",
        expiresAt: user.subscriptionEndDate,
      })
    }

    // Return specific reason for blocked access
    let reason = "no_subscription"
    if (isExpired) {
      reason = "subscription_expired"
    } else if (user.subscriptionStatus === "cancelled") {
      reason = "subscription_cancelled"
    }

    return NextResponse.json({
      hasAccess: false,
      reason,
      expiresAt: user.subscriptionEndDate,
    })
  } catch (error) {
    console.error("Error checking subscription:", error)
    return NextResponse.json({ hasAccess: false, reason: "error" }, { status: 500 })
  }
}
