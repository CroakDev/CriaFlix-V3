"use client"

import { useState, useEffect } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import MediaCard from "@/app/components/Lists/MediaCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "3292348a48f36b094081736c090646ee"

interface Media {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  overview: string
  release_date?: string
  first_air_date?: string
  genre_ids: number[]
}

export default function MadeForYouPage() {
  const [recommendations, setRecommendations] = useState<Media[]>([])
  const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [hasHistory, setHasHistory] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    if (session) {
      fetchRecommendations()
    }
  }, [session])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      // Fetch user's favorites and watchlist to base recommendations on
      const [favoritesRes, watchlistRes] = await Promise.all([fetch("/api/favorites"), fetch("/api/watchlist")])

      if (!favoritesRes.ok || !watchlistRes.ok) {
        throw new Error("Failed to fetch user data")
      }

      const favoritesData = await favoritesRes.json()
      const watchlistData = await watchlistRes.json()

      const allMovieIds = [
        ...favoritesData.movies.map((m: any) => m.movieId),
        ...watchlistData.movies.map((m: any) => m.movieId),
      ]

      const allSeriesIds = [
        ...favoritesData.series.map((s: any) => s.seriesId),
        ...watchlistData.series.map((s: any) => s.seriesId),
      ]

      const wIds = new Set<number>()
      watchlistData.movies?.forEach((m: any) => wIds.add(m.movieId))
      watchlistData.series?.forEach((s: any) => wIds.add(s.seriesId))
      setWatchlistIds(wIds)

      if (allMovieIds.length === 0 && allSeriesIds.length === 0) {
        setHasHistory(false)
        // Show trending instead
        const response = await fetch(
          `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}&language=pt-BR`,
        )
        const data = await response.json()
        setRecommendations(data.results || [])
      } else {
        setHasHistory(true)
        // Get recommendations based on first item in favorites or watchlist
        const sampleId = allMovieIds[0] || allSeriesIds[0]
        const mediaType = allMovieIds[0] ? "movie" : "tv"

        const response = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${sampleId}/recommendations?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`,
        )
        const data = await response.json()

        if (data.results && data.results.length > 0) {
          setRecommendations(data.results)
        } else {
          // Fallback to trending
          const trendingResponse = await fetch(
            `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}&language=pt-BR`,
          )
          const trendingData = await trendingResponse.json()
          setRecommendations(trendingData.results || [])
        }
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as recomendações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleWatchlist = async (item: Media) => {
    if (!session) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar à sua lista",
        variant: "destructive",
      })
      return
    }

    try {
      const mediaType = item.title ? "movie" : "tv"
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mediaType,
          id: item.id,
          title: item.title || item.name,
          posterPath: item.poster_path,
        }),
      })

      const data = await response.json()

      if (data.action === "added") {
        setWatchlistIds((prev) => new Set(prev).add(item.id))
        toast({
          title: "Adicionado",
          description: `${item.title || item.name} foi adicionado à sua lista`,
        })
      } else {
        setWatchlistIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(item.id)
          return newSet
        })
        toast({
          title: "Removido",
          description: `${item.title || item.name} foi removido da sua lista`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a lista",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Made For You</h1>
            <p className="text-muted-foreground text-sm">
              {hasHistory
                ? "Personalized recommendations based on your favorites and watchlist"
                : "Trending content to get you started"}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !hasHistory ? (
        <div className="mb-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            Start adding content to your favorites or watchlist to get personalized recommendations!
          </p>
          <Button asChild size="sm">
            <Link href="/browse">Browse Content</Link>
          </Button>
        </div>
      ) : null}

      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No recommendations available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-8">
          {recommendations.map((item, index) => {
            const isInWatchlist = watchlistIds.has(item.id)
            const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0]

            return (
              <MediaCard
                key={item.id}
                id={item.id}
                title={item.title || item.name || ""}
                posterPath={item.poster_path}
                backdropPath={item.backdrop_path}
                voteAverage={item.vote_average}
                overview={item.overview}
                year={year}
                isInWatchlist={isInWatchlist}
                onToggleWatchlist={() => toggleWatchlist(item)}
                index={index}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
