"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Info, X, Loader2, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

interface FavoriteItem {
  id: number
  movieId?: number
  seriesId?: number
  movieTitle?: string
  seriesTitle?: string
  posterPath: string | null
  createdAt: string
}

interface MediaDetails {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type: string
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "3292348a48f36b094081736c090646ee"

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [favorites, setFavorites] = useState<{ movies: FavoriteItem[]; series: FavoriteItem[] }>({
    movies: [],
    series: [],
  })
  const [mediaDetails, setMediaDetails] = useState<MediaDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    if (session) {
      fetchFavorites()
    }
  }, [session])

  const fetchFavorites = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/favorites")
      if (!response.ok) throw new Error("Failed to fetch favorites")

      const data = await response.json()
      setFavorites(data)

      const details = await Promise.all([
        ...data.movies.map(async (item: FavoriteItem) => {
          try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${item.movieId}?api_key=${TMDB_API_KEY}`)
            if (res.ok) {
              const movieData = await res.json()
              return { ...movieData, media_type: "movie" }
            }
          } catch (e) {
            console.error("Error fetching movie:", e)
          }
          return null
        }),
        ...data.series.map(async (item: FavoriteItem) => {
          try {
            const res = await fetch(`https://api.themoviedb.org/3/tv/${item.seriesId}?api_key=${TMDB_API_KEY}`)
            if (res.ok) {
              const seriesData = await res.json()
              return { ...seriesData, media_type: "tv" }
            }
          } catch (e) {
            console.error("Error fetching series:", e)
          }
          return null
        }),
      ])

      setMediaDetails(details.filter(Boolean) as MediaDetails[])
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromFavorites = async (id: number, type: string) => {
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, title: "", posterPath: "" }),
      })

      await fetchFavorites()

      toast({
        title: "Removed from Favorites",
        description: "Item removed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      })
    }
  }

  const filteredMedia = mediaDetails.filter((item) => activeTab === "all" || item.media_type === activeTab)

  const totalCount = favorites.movies.length + favorites.series.length

  return (
    <div className="container mx-auto p-2 sm:p-4 pb-20 md:pb-4 bg-background text-foreground">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Favorites</h1>
        <Badge variant="secondary" className="text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2">
          {totalCount} {totalCount === 1 ? "item" : "items"}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="movie">Movies ({favorites.movies.length})</TabsTrigger>
          <TabsTrigger value="tv">Series ({favorites.series.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-4">No favorites yet</h2>
          <p className="text-muted-foreground mb-6">Start adding your favorite movies and series!</p>
          <Button asChild>
            <Link href="/browse">Browse Content</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          <AnimatePresence>
            {filteredMedia.map((item) => {
              const title = item.title || item.name || "Untitled"
              const year = (item.release_date || item.first_air_date || "").split("-")[0]

              return (
                <motion.div
                  key={item.id}
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
                          <Link href={`/media/${item.id}?mediaType=${item.media_type}`}>
                            <Info className="h-4 w-4 mr-1" /> Details
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromFavorites(item.id, item.media_type)}
                        >
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8"
                        onClick={() => removeFromFavorites(item.id, item.media_type)}
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
                          {item.vote_average.toFixed(1)}
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
