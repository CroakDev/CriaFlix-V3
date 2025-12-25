import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!session?.user?.email && !userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let playlists

    if (userId) {
      // Get public playlists from a specific user
      playlists = await prisma.playlist.findMany({
        where: {
          userId: Number.parseInt(userId),
          isPublic: true,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          items: {
            orderBy: { addedAt: "desc" },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      })
    } else {
      // Get current user's playlists
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      playlists = await prisma.playlist.findMany({
        where: { userId: user.id },
        include: {
          items: {
            orderBy: { addedAt: "desc" },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      })
    }

    return NextResponse.json(playlists)
  } catch (error) {
    console.error("Error fetching playlists:", error)
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 })
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
    const { title, description, isPublic, coverImage } = body

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const playlist = await prisma.playlist.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        isPublic: isPublic || false,
        coverImage: coverImage || null,
        userId: user.id,
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    })

    return NextResponse.json(playlist)
  } catch (error) {
    console.error("Error creating playlist:", error)
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 })
  }
}
