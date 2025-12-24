"use client"

import { useState, useEffect } from "react"
import { Loader2, Calendar } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import MediaCard from "@/app/components/Lists/MediaCard"

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
}

export default function NewReleasesPage() {
  const [activeTab, setActiveTab] = useState<"movies" | "series">("movies")
  const [media, setMedia] = useState<Media[]>([])
  const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set())
  const [favoritesIds, setFavoritesIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    if (session) {
      fetchUserLists()
    }
  }, [session])

  useEffect(() => {
    fetchNewReleases()
  }, [activeTab])

  const fetchUserLists = async () => {
    try {
      const [watchlistRes, favoritesRes] = await Promise.all([fetch("/api/watchlist"), fetch("/api/favorites")])

      if (watchlistRes.ok && favoritesRes.ok) {
        const watchlistData = await watchlistRes.json()
        const favoritesData = await favoritesRes.json()

        const wIds = new Set<number>()
        watchlistData.movies?.forEach((m: any) => wIds.add(m.movieId))
        watchlistData.series?.forEach((s: any) => wIds.add(s.seriesId))
        setWatchlistIds(wIds)

        const fIds = new Set<number>()
        favoritesData.movies?.forEach((m: any) => fIds.add(m.movieId))
        favoritesData.series?.forEach((s: any) => fIds.add(s.seriesId))
        setFavoritesIds(fIds)
      }
    } catch (error) {
      console.error("Error fetching user lists:", error)
    }
  }

  const fetchNewReleases = async () => {
    setLoading(true)
    try {
      const endpoint = activeTab === "movies" ? "movie" : "tv"
      const dateParam = activeTab === "movies" ? "primary_release_date" : "first_air_date"

      // Get releases from the last 30 days
      const today = new Date()
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      const todayStr = today.toISOString().split("T")[0]
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]

      const url = `https://api.themoviedb.org/3/discover/${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=${dateParam}.desc&${dateParam}.gte=${thirtyDaysAgoStr}&${dateParam}.lte=${todayStr}&include_adult=false&page=1`

      const response = await fetch(url)
      const data = await response.json()
      setMedia(data.results || [])
    } catch (error) {
      console.error("Error fetching new releases:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os lançamentos",
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
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab === "movies" ? "movie" : "tv",
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
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">New Releases</h1>
            <p className="text-muted-foreground text-sm">Latest movies and series from the last 30 days</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "movies" | "series")} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="series">TV Series</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No new releases found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-8">
          {media.map((item, index) => {
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
