"use client"

import { useState, useEffect } from "react"
import { Calendar, Sparkles } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import MediaCard from "@/app/components/Lists/MediaCard"
import MediaCardSkeleton from "@/app/components/Lists/MediaCardSkeleton"
import { motion } from "framer-motion"

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
  const [favoritesIds, setFavoritesIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()
  const t = useTranslations("NewReleases")

  useEffect(() => {
    if (session) {
      fetchUserFavorites()
    }
  }, [session])

  useEffect(() => {
    fetchNewReleases()
  }, [activeTab])

  const fetchUserFavorites = async () => {
    try {
      const response = await fetch("/api/favorites")

      if (response.ok) {
        const favoritesData = await response.json()

        const fIds = new Set<number>()
        favoritesData.movies?.forEach((m: any) => fIds.add(m.movieId))
        favoritesData.series?.forEach((s: any) => fIds.add(s.seriesId))
        setFavoritesIds(fIds)
      }
    } catch (error) {
      console.error("Error fetching favorites:", error)
    }
  }

  const fetchNewReleases = async () => {
    setLoading(true)
    try {
      const endpoint = activeTab === "movies" ? "movie" : "tv"
      const dateParam = activeTab === "movies" ? "primary_release_date" : "first_air_date"

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

  const toggleFavorites = async (item: Media) => {
    if (!session) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar aos favoritos",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/favorites", {
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
        setFavoritesIds((prev) => new Set(prev).add(item.id))
        toast({
          title: "Adicionado",
          description: `${item.title || item.name} foi adicionado aos favoritos`,
        })
      } else {
        setFavoritesIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(item.id)
          return newSet
        })
        toast({
          title: "Removido",
          description: `${item.title || item.name} foi removido dos favoritos`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      <div className="relative bg-gradient-to-b from-primary/10 via-background to-background pb-8 mb-8">
        <div className="container mx-auto px-4 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "movies" | "series")} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-11">
              <TabsTrigger value="movies" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {t("movies")}
              </TabsTrigger>
              <TabsTrigger value="series" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {t("series")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        ) : media.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative p-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                <Calendar className="h-20 w-20 text-primary" />
              </div>
            </div>
            <p className="text-muted-foreground text-lg">{t("noResults")}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {media.map((item, index) => {
              const isInFavorites = favoritesIds.has(item.id)
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
                  isInWatchlist={isInFavorites}
                  onToggleWatchlist={() => toggleFavorites(item)}
                  index={index}
                  mediaType={activeTab === "movies" ? "movie" : "tv"}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
