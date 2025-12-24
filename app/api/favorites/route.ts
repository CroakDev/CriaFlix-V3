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
        movieFavorites: {
          orderBy: { createdAt: "desc" },
        },
        seriesFavorites: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      movies: user.movieFavorites,
      series: user.seriesFavorites,
    })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
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
      const existing = await prisma.movieFavorite.findFirst({
        where: {
          userId: user.id,
          movieId: id,
        },
      })

      if (existing) {
        await prisma.movieFavorite.delete({
          where: { id: existing.id },
        })
        return NextResponse.json({ action: "removed" })
      } else {
        await prisma.movieFavorite.create({
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
      const existing = await prisma.seriesFavorite.findFirst({
        where: {
          userId: user.id,
          seriesId: id,
        },
      })

      if (existing) {
        await prisma.seriesFavorite.delete({
          where: { id: existing.id },
        })
        return NextResponse.json({ action: "removed" })
      } else {
        await prisma.seriesFavorite.create({
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
    console.error("Error updating favorites:", error)
    return NextResponse.json({ error: "Failed to update favorites" }, { status: 500 })
  }
}
