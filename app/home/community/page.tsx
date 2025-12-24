"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Globe, ListVideo } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

interface Playlist {
  id: number
  title: string
  description: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
  user: {
    name: string | null
    email: string
  }
  _count: {
    items: number
  }
}

export default function CommunityPage() {
  const [publicPlaylists, setPublicPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPublicPlaylists()
  }, [])

  const fetchPublicPlaylists = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/public-playlists")
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()
      setPublicPlaylists(data.playlists)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to load community playlists",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Community</h1>
            <p className="text-muted-foreground text-sm">Discover public playlists from other users</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : publicPlaylists.length === 0 ? (
        <div className="text-center py-12">
          <ListVideo className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-4">No public playlists yet</h2>
          <p className="text-muted-foreground mb-6">Be the first to share a playlist with the community!</p>
          <Button asChild>
            <Link href="/playlists">Create Public Playlist</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicPlaylists.map((playlist) => (
            <Card key={playlist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{playlist.title}</CardTitle>
                    {playlist.description && (
                      <CardDescription className="mt-1 line-clamp-2">{playlist.description}</CardDescription>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      By {playlist.user.name || playlist.user.email.split("@")[0]}
                    </p>
                  </div>
                  <Globe className="h-4 w-4 text-green-500 shrink-0 ml-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">
                    {playlist._count.items} {playlist._count.items === 1 ? "item" : "items"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(playlist.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <Button asChild variant="default" className="w-full" size="sm">
                  <Link href={`/playlists/${playlist.id}`}>View Playlist</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
