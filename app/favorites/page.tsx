"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import MediaCard from "../components/Lists/MediaCard"
import MediaCardSkeleton from "../components/Lists/MediaCardSkeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
  backdrop_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  overview: string
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
  const t = useTranslations("Favorites")

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
        title: t("error"),
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
        title: t("removedSuccess"),
        description: t("removedDescription"),
      })
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to remove from favorites",
        variant: "destructive",
      })
    }
  }

  const filteredMedia = mediaDetails.filter((item) => {
    if (activeTab === "all") return true
    if (activeTab === "movies") return item.media_type === "movie"
    if (activeTab === "series") return item.media_type === "tv"
    return true
  })

  const totalCount = favorites.movies.length + favorites.series.length

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      <div className="relative bg-gradient-to-b from-primary/10 via-background to-background pb-8 mb-8">
        <div className="container mx-auto px-4 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 shadow-lg">
              <Heart className="h-8 w-8 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {totalCount} {totalCount === 1 ? "item" : t("items")}
              </p>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-11">
              <TabsTrigger value="all" className="gap-2">
                {t("all")}
              </TabsTrigger>
              <TabsTrigger value="movies" className="gap-2">
                {t("movies")} <span className="text-xs opacity-70">({favorites.movies.length})</span>
              </TabsTrigger>
              <TabsTrigger value="series" className="gap-2">
                {t("series")} <span className="text-xs opacity-70">({favorites.series.length})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative p-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                <Heart className="h-20 w-20 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-3">{t("empty")}</h2>
            <p className="text-muted-foreground mb-8 max-w-md">{t("emptyDescription")}</p>
            <Button size="lg" asChild className="gap-2">
              <Link href="/browse">
                <Sparkles className="h-5 w-5" />
                Browse Content
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredMedia.map((item, index) => {
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
                    <MediaCard
                      id={item.id}
                      title={title}
                      posterPath={item.poster_path}
                      backdropPath={item.backdrop_path}
                      voteAverage={item.vote_average}
                      overview={item.overview}
                      year={year}
                      isInWatchlist={true}
                      onToggleWatchlist={() => removeFromFavorites(item.id, item.media_type)}
                      index={index}
                      mediaType={item.media_type as "movie" | "tv"}
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
