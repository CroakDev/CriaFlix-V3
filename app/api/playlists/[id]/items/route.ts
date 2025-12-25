import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
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
      include: {
        _count: {
          select: { items: true },
        },
      },
    })

    if (!playlist || playlist.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { mediaId, mediaType, mediaTitle, posterPath } = body

    if (!mediaId || !mediaType || !mediaTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if item already exists
    const existingItem = await prisma.playlistItem.findFirst({
      where: {
        playlistId,
        mediaId,
        mediaType,
      },
    })

    if (existingItem) {
      // Remove if exists (toggle)
      await prisma.playlistItem.delete({
        where: { id: existingItem.id },
      })
      
      // Update playlist timestamp
      await prisma.playlist.update({
        where: { id: playlistId },
        data: { updatedAt: new Date() },
      })
      
      return NextResponse.json({ 
        action: "removed",
        itemCount: Math.max(0, playlist._count.items - 1)
      })
    }

    // Add new item
    const item = await prisma.playlistItem.create({
      data: {
        playlistId,
        mediaId,
        mediaType,
        mediaTitle,
        posterPath,
      },
    })

    // Update playlist timestamp
    await prisma.playlist.update({
      where: { id: playlistId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ 
      action: "added", 
      item,
      itemCount: playlist._count.items + 1
    })
  } catch (error) {
    console.error("Error adding to playlist:", error)
    return NextResponse.json({ error: "Failed to add to playlist" }, { status: 500 })
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

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 })
    }

    await prisma.playlistItem.delete({
      where: { id: Number.parseInt(itemId) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing from playlist:", error)
    return NextResponse.json({ error: "Failed to remove from playlist" }, { status: 500 })
  }
}
