"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, X, Loader2, ArrowLeft, Share2, Globe, Lock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import PlaylistDropdown from "@/app/components/PlaylistDropdown"

interface PlaylistItem {
  id: number
  mediaId: number
  mediaType: string
  mediaTitle: string
  posterPath: string | null
  addedAt: string
}

interface Playlist {
  id: number
  title: string
  description: string | null
  isPublic: boolean
  items: PlaylistItem[]
  user: {
    name: string | null
    email: string
  }
  _count: {
    items: number
  }
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "3292348a48f36b094081736c090646ee"

export default function PlaylistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [mediaDetails, setMediaDetails] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (params.id) {
      fetchPlaylist()
    }
  }, [params.id])

  useEffect(() => {
    const handleRefresh = () => {
      if (params.id) {
        fetchPlaylist()
      }
    }

    window.addEventListener('refreshPlaylists', handleRefresh)
    return () => window.removeEventListener('refreshPlaylists', handleRefresh)
  }, [params.id])

  const fetchPlaylist = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/playlists/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch playlist")

      const data = await response.json()
      setPlaylist(data)

      // Fetch media details from TMDB
      const details = await Promise.all(
        data.items.map(async (item: PlaylistItem) => {
          try {
            const endpoint = item.mediaType === "movie" ? "movie" : "tv"
            const res = await fetch(`https://api.themoviedb.org/3/${endpoint}/${item.mediaId}?api_key=${TMDB_API_KEY}`)
            if (res.ok) {
              const mediaData = await res.json()
              return { ...mediaData, playlistItemId: item.id, media_type: item.mediaType }
            }
          } catch (e) {
            console.error("Error fetching media:", e)
          }
          return null
        }),
      )

      setMediaDetails(details.filter(Boolean))
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to load playlist",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromPlaylist = async (itemId: number) => {
    try {
      const response = await fetch(`/api/playlists/${params.id}/items?itemId=${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove item")

      await fetchPlaylist()

      toast({
        title: "Success",
        description: "Item removed from playlist",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  const sharePlaylist = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied!",
      description: "Playlist link copied to clipboard",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Playlist not found</h2>
        <Button onClick={() => router.push("/playlists")}>Back to Playlists</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 pb-20 md:pb-4">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{playlist.title}</h1>
              {playlist.isPublic ? (
                <Globe className="h-5 w-5 text-green-500" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            {playlist.description && <p className="text-muted-foreground">{playlist.description}</p>}
            <p className="text-sm text-muted-foreground mt-2">By {playlist.user.name || playlist.user.email}</p>
          </div>
          {playlist.isPublic && (
            <Button variant="outline" size="sm" onClick={sharePlaylist}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
        <Badge variant="secondary">
          {playlist._count.items} {playlist._count.items === 1 ? "item" : "items"}
        </Badge>
      </div>

      {mediaDetails.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-6">This playlist is empty</p>
          <Button asChild>
            <Link href="/browse">Browse Content</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          <AnimatePresence>
            {mediaDetails.map((item) => {
              const title = item.title || item.name || "Untitled"
              const year = (item.release_date || item.first_air_date || "").split("-")[0]

              return (
                <motion.div
                  key={item.playlistItemId}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden group relative">
                    <div className="relative aspect-[2/3]">
                      {item.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <span className="text-muted-foreground">No Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4">
                        <Button size="sm" variant="secondary" asChild>
                          <Link href={`/media/${item.id}?mediaType=${item.media_type}`}>View Details</Link>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => removeFromPlaylist(item.playlistItemId)}>
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                        <PlaylistDropdown
                          mediaId={item.id}
                          mediaType={item.media_type === "movie" ? "movie" : "tv"}
                          mediaTitle={item.title || item.name || ""}
                          posterPath={item.poster_path}
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8"
                        onClick={() => removeFromPlaylist(item.playlistItemId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{title}</h3>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{year}</span>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-400 fill-yellow-400" />
                          {item.vote_average?.toFixed(1) || "N/A"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
