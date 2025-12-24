import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        movieWatchLater: {
          orderBy: { createdAt: "desc" },
        },
        seriesWatchLater: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      movies: user.movieWatchLater,
      series: user.seriesWatchLater,
    })
  } catch (error) {
    console.error("Error fetching watch later:", error)
    return NextResponse.json({ error: "Failed to fetch watch later" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { type, id, title, posterPath } = body

    if (type === "movie") {
      const existing = await prisma.movieWatchLater.findFirst({
        where: {
          userId: user.id,
          movieId: id,
        },
      })

      if (existing) {
        await prisma.movieWatchLater.delete({
          where: { id: existing.id },
        })
        return NextResponse.json({ action: "removed" })
      } else {
        await prisma.movieWatchLater.create({
          data: {
            userId: user.id,
            movieId: id,
            movieTitle: title,
            posterPath,
          },
        })
        return NextResponse.json({ action: "added" })
      }
    } else if (type === "tv") {
      const existing = await prisma.seriesWatchLater.findFirst({
        where: {
          userId: user.id,
          seriesId: id,
        },
      })

      if (existing) {
        await prisma.seriesWatchLater.delete({
          where: { id: existing.id },
        })
        return NextResponse.json({ action: "removed" })
      } else {
        await prisma.seriesWatchLater.create({
          data: {
            userId: user.id,
            seriesId: id,
            seriesTitle: title,
            posterPath,
          },
        })
        return NextResponse.json({ action: "added" })
      }
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Error updating watch later:", error)
    return NextResponse.json({ error: "Failed to update watch later" }, { status: 500 })
  }
}
