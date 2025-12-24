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
        movieWatchlist: {
          orderBy: { createdAt: "desc" },
        },
        seriesWatchlist: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      movies: user.movieWatchlist,
      series: user.seriesWatchlist,
    })
  } catch (error) {
    console.error("Error fetching watchlist:", error)
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 })
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
      const existing = await prisma.movieWatchlist.findFirst({
        where: {
          userId: user.id,
          movieId: id,
        },
      })

      if (existing) {
        await prisma.movieWatchlist.delete({
          where: { id: existing.id },
        })
        return NextResponse.json({ action: "removed" })
      } else {
        await prisma.movieWatchlist.create({
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
      const existing = await prisma.seriesWatchlist.findFirst({
        where: {
          userId: user.id,
          seriesId: id,
        },
      })

      if (existing) {
        await prisma.seriesWatchlist.delete({
          where: { id: existing.id },
        })
        return NextResponse.json({ action: "removed" })
      } else {
        await prisma.seriesWatchlist.create({
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
    console.error("Error updating watchlist:", error)
    return NextResponse.json({ error: "Failed to update watchlist" }, { status: 500 })
  }
}
