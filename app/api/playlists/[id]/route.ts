import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const playlistId = Number.parseInt(params.id)

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
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
    })

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
    }

    // Check if playlist is public or belongs to current user
    const session = await getServerSession()
    if (!playlist.isPublic) {
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })

      if (!user || user.id !== playlist.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    return NextResponse.json(playlist)
  } catch (error) {
    console.error("Error fetching playlist:", error)
    return NextResponse.json({ error: "Failed to fetch playlist" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const playlistId = Number.parseInt(params.id)
    const body = await request.json()
    const { title, description, coverImage, isPublic } = body

    // Check ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist || playlist.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        title: title?.trim() || playlist.title,
        description: description !== undefined ? description?.trim() || null : playlist.description,
        coverImage: coverImage !== undefined ? coverImage?.trim() || null : playlist.coverImage,
        isPublic: isPublic !== undefined ? isPublic : playlist.isPublic,
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    })

    return NextResponse.json(updatedPlaylist)
  } catch (error) {
    console.error("Error updating playlist:", error)
    return NextResponse.json({ error: "Failed to update playlist" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const playlistId = Number.parseInt(params.id)

    // Check ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist || playlist.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.playlist.delete({
      where: { id: playlistId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting playlist:", error)
    return NextResponse.json({ error: "Failed to delete playlist" }, { status: 500 })
  }
}
