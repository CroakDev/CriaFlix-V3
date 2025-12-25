"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import TmdbApi from "@/lib/TmdbApi"
import MediaCard from "./MediaCard"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

interface MediaItem {
  id: number
  title?: string
  name?: string
  backdrop_path: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  media_type: "movie" | "tv"
  vote_average?: number
  overview?: string
}

interface HomeListItem {
  slug: string
  title: string
  items: MediaItem[]
}

export default function MediaList() {
  const [lists, setLists] = useState<HomeListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favoritesIds, setFavoritesIds] = useState<Set<number>>(new Set())
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const data = await TmdbApi.getHomeList()
        setLists(data as unknown as HomeListItem[])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching lists:", error)
        setIsLoading(false)
      }
    }

    fetchLists()
  }, [])

  useEffect(() => {
    if (session) {
      fetchFavorites()
    }
  }, [session])

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites")
      if (!response.ok) return

      const data = await response.json()
      const fIds = new Set<number>()
      data.movies?.forEach((m: any) => fIds.add(m.movieId))
      data.series?.forEach((s: any) => fIds.add(s.seriesId))
      setFavoritesIds(fIds)
    } catch (error) {
      console.error("Error fetching favorites:", error)
    }
  }

  const toggleFavorites = async (item: MediaItem) => {
    if (!session) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar aos favoritos",
        variant: "destructive",
      })
      return
    }

    try {
      const mediaType = item.media_type === "tv" ? "tv" : "movie"
      const title = item.title || item.name || ""

      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mediaType,
          id: item.id,
          title: title,
          posterPath: item.poster_path || item.backdrop_path,
        }),
      })

      const data = await response.json()

      if (data.action === "added") {
        setFavoritesIds((prev) => new Set(prev).add(item.id))
        toast({
          title: "Adicionado",
          description: `${title} foi adicionado aos favoritos`,
        })
      } else {
        setFavoritesIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(item.id)
          return newSet
        })
        toast({
          title: "Removido",
          description: `${title} foi removido dos favoritos`,
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

  const SkeletonItem = () => (
    <div className="w-full">
      <div className="aspect-video rounded-md overflow-hidden mb-2">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="flex space-x-2">
        <div className="flex-1">
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full space-y-8 py-6 px-4 pt-1">
      {isLoading ? (
        <div className="space-y-8">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-7 w-40" />
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-8">
                {[...Array(6)].map((_, itemIndex) => (
                  <SkeletonItem key={itemIndex} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        lists.map((list) => (
          <div key={list.slug} className="space-y-4">
            <h2 className="text-xl font-bold">{list.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {list.items.slice(0, 12).map((media, index) => {
                const title = media.title || media.name || ""
                const year = (media.release_date || media.first_air_date || "")?.substring(0, 4)
                const isInFavorites = favoritesIds.has(media.id)

                return (
                  <MediaCard
                    key={media.id}
                    id={media.id}
                    title={title}
                    posterPath={media.poster_path || null}
                    backdropPath={media.backdrop_path}
                    voteAverage={media.vote_average || 0}
                    overview={media.overview || ""}
                    year={year}
                    isInWatchlist={isInFavorites}
                    onToggleWatchlist={() => toggleFavorites(media)}
                    index={index}
                    mediaType={media.media_type}
                  />
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
