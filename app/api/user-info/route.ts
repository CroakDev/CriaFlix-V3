import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const email = session.user.email

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        isVip: true,
        isAdmin: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
        subscriptionRenewable: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if subscription expired
    const now = new Date()
    if (user.subscriptionEndDate && user.subscriptionEndDate < now && user.subscriptionStatus === "active") {
      // Auto-expire
      await prisma.user.update({
        where: { email },
        data: {
          subscriptionStatus: "expired",
          isVip: false,
        },
      })

      return NextResponse.json({
        ...user,
        isVip: false,
        subscriptionStatus: "expired",
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user info:", error)
    return NextResponse.json({ error: "Failed to fetch user info" }, { status: 500 })
  }
}
