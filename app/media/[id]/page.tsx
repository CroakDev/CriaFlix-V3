"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Heart, Plus, ChevronRight, Lock, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import TmdbApi from "@/lib/TmdbApi"
import { useSearchParams } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { useSession } from "next-auth/react"
import Recommended from "@/app/components/Lists/Recommended"
import ServerSelection from "../../components/Player/player"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SubscriptionBlockModal from "@/app/components/SubscriptionBlockModal"

interface MediaInfo {
  id: number
  title?: string
  name?: string
  backdrop_path?: string
  overview?: string
  release_date?: string
  first_air_date?: string
  production_companies?: {
    logo_path?: string
    name: string
  }[]
  externalIds: {
    imdb_id?: string
    facebook_id?: string
    instagram_id?: string
    twitter_id?: string
  }
  revenue?: number
  number_of_seasons?: number
}

interface Episode {
  id: number
  episode_number: number
  season_number: number
  name: string
  overview: string
  still_path: string
  air_date: string
  runtime: number
  vote_average: number
}

interface Season {
  id: number
  season_number: number
  name: string
  overview: string
  poster_path: string
  episode_count: number
  air_date: string
}

export default function MediaDetailPage({ params }: { params: { id: string } }) {
  const [isInFavorites, setIsInFavorites] = useState(false)
  const [media, setMedia] = useState<MediaInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)
  const [hasAccess, setHasAccess] = useState(true)
  const [blockReason, setBlockReason] = useState<"subscription_expired" | "no_subscription" | "subscription_cancelled">(
    "no_subscription",
  )
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null)

  const { data: session, status } = useSession()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const mediaType = searchParams.get("mediaType") || "movie"

  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        const mediaId = Number.parseInt(params.id)
        if (isNaN(mediaId)) {
          throw new Error("Invalid media ID")
        }

        const data = await TmdbApi.getMediaInfo(mediaId, mediaType as "movie" | "tv")
        setMedia(data)

        if (mediaType === "tv") {
          const seasonsData = await TmdbApi.getSeasons(mediaId)
          const validSeasons = seasonsData.filter((s) => s.season_number > 0)
          setSeasons(validSeasons)

          if (validSeasons.length > 0) {
            setSelectedSeason(validSeasons[0].season_number)
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching media details:", error)
        setError("Error fetching media details")
        setIsLoading(false)
      }
    }

    fetchMediaDetails()
  }, [params.id])

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (mediaType !== "tv" || !selectedSeason) return

      setLoadingEpisodes(true)
      try {
        const mediaId = Number.parseInt(params.id)
        const episodesData = await TmdbApi.getSeasonEpisodes(mediaId, selectedSeason)
        setEpisodes(episodesData)

        if (episodesData.length > 0 && !selectedEpisode) {
          setSelectedEpisode(episodesData[0])
        }
      } catch (error) {
        console.error("Error fetching episodes:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os episódios",
          variant: "destructive",
        })
      } finally {
        setLoadingEpisodes(false)
      }
    }

    fetchEpisodes()
  }, [selectedSeason, params.id])

  useEffect(() => {
    const checkFavorites = async () => {
      if (!session || !media) return

      try {
        const response = await fetch("/api/favorites")
        if (!response.ok) return

        const data = await response.json()
        const mediaId = Number.parseInt(params.id)

        const isInList =
          mediaType === "movie"
            ? data.movies?.some((m: any) => m.movieId === mediaId)
            : data.series?.some((s: any) => s.seriesId === mediaId)

        setIsInFavorites(isInList)
      } catch (error) {
        console.error("Error checking favorites:", error)
      }
    }

    checkFavorites()
  }, [session, media, params.id])

  useEffect(() => {
    const checkSubscription = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/subscription/check")
          const data = await res.json()

          setHasAccess(data.hasAccess)
          if (!data.hasAccess) {
            setBlockReason(data.reason)
            setSubscriptionEndDate(data.expiresAt ? new Date(data.expiresAt) : null)
            setShowBlockModal(true)
          }
        } catch (error) {
          console.error("Error checking subscription:", error)
        }
      }
    }

    checkSubscription()
  }, [status])

  const serverData = media
    ? {
        backgroundImage: `https://image.tmdb.org/t/p/w500${media.backdrop_path}`,
        servers:
          mediaType === "movie"
            ? [
                {
                  id: "server1",
                  name: "SuperFlix",
                  url: `https://superflixapi.asia/filme/${media.externalIds.imdb_id}`,
                  country: "BR",
                  premium: false,
                },
                {
                  id: "server2",
                  name: "Warez",
                  url: `https://embed.warezcdn.link/filme/${media.externalIds.imdb_id}`,
                  country: "BR",
                  premium: false,
                },
                {
                  id: "server4",
                  name: "VidSrc",
                  url: `https://vidsrc.me/embed/movie/${media.id}`,
                  country: "US",
                  premium: false,
                },
                {
                  id: "server5",
                  name: "Servidor Alpha",
                  url: `https://spencerdevs.xyz/movie/${media.externalIds.imdb_id}`,
                  country: "US",
                  premium: false,
                },
              ]
            : selectedEpisode
              ? [
                  {
                    id: "server1",
                    name: "SuperFlix",
                    url: `https://superflixapi.asia/serie/${media.externalIds.imdb_id}/${selectedEpisode.season_number}/${selectedEpisode.episode_number}`,
                    country: "BR",
                    premium: false,
                  },
                  {
                    id: "server2",
                    name: "Warez",
                    url: `https://embed.warezcdn.link/serie/${media.externalIds.imdb_id}/${selectedEpisode.season_number}/${selectedEpisode.episode_number}`,
                    country: "BR",
                    premium: false,
                  },
                  {
                    id: "server4",
                    name: "VidSrc",
                    url: `https://vidsrc.me/embed/tv/${media.id}/${selectedEpisode.season_number}/${selectedEpisode.episode_number}`,
                    country: "US",
                    premium: false,
                  },
                ]
              : [],
      }
    : {
        backgroundImage: "https://example.com/background-image.jpg",
        servers: [],
      }

  const toggleFavorites = async () => {
    if (!session) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar aos favoritos",
        variant: "destructive",
      })
      return
    }

    if (!media) return

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mediaType,
          id: Number.parseInt(params.id),
          title: media.title || media.name,
          posterPath: media.backdrop_path,
        }),
      })

      const data = await response.json()

      if (data.action === "added") {
        setIsInFavorites(true)
        toast({
          title: "Adicionado",
          description: "Item adicionado aos favoritos",
        })
      } else {
        setIsInFavorites(false)
        toast({
          title: "Removido",
          description: "Item removido dos favoritos",
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

  const handleEpisodeSelect = (episode: Episode) => {
    setSelectedEpisode(episode)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goToNextEpisode = () => {
    if (!selectedEpisode) return

    const currentIndex = episodes.findIndex((ep) => ep.episode_number === selectedEpisode.episode_number)
    if (currentIndex < episodes.length - 1) {
      setSelectedEpisode(episodes[currentIndex + 1])
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (selectedSeason < seasons.length) {
      setSelectedSeason(selectedSeason + 1)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!media) return <div>Media not found</div>

  return (
    <>
      <SubscriptionBlockModal
        open={showBlockModal}
        onOpenChange={setShowBlockModal}
        reason={blockReason}
        expiresAt={subscriptionEndDate}
      />

      <div className="container mx-auto px-2 sm:px-4 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-2 xl:col-span-3">
            {!hasAccess ? (
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center relative">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="relative z-10 text-center p-8">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">VIP Subscription Required</h3>
                  <p className="text-muted-foreground mb-4">This content is only available to VIP subscribers</p>
                  <Button
                    size="lg"
                    className="bg-[#ffc34f] text-black hover:bg-[#ffc34f]/90"
                    onClick={() => setShowBlockModal(true)}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Subscribe Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <ServerSelection
                  {...serverData}
                  episodeKey={
                    selectedEpisode ? `s${selectedEpisode.season_number}e${selectedEpisode.episode_number}` : undefined
                  }
                  onEnded={mediaType === "tv" ? goToNextEpisode : undefined}
                />
              </div>
            )}

            {mediaType === "tv" && selectedEpisode && (
              <div className="mt-4 bg-secondary/50 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">
                      T{selectedEpisode.season_number}E{selectedEpisode.episode_number}: {selectedEpisode.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{selectedEpisode.overview}</p>
                  </div>
                  <Button onClick={goToNextEpisode} size="lg" className="flex-shrink-0">
                    Próximo Episódio
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            <h1 className="text-2xl font-bold mt-4">{media.title || media.name}</h1>

            <div className="flex flex-wrap items-center justify-between ">
              <p className="text-gray-500 text-sm">
                {media.revenue?.toLocaleString("en-US")} views •
                <span className="ml-1">
                  {media.release_date || media.first_air_date
                    ? formatDistanceToNow(new Date(media.release_date || (media.first_air_date as string)), {
                        locale: ptBR,
                        addSuffix: true,
                      })
                    : "Data não disponível"}
                </span>
              </p>
              <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  +1k
                </Button>
                <Button variant="ghost" size="sm">
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Dislike
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className=" h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pb-4 border-b">
              <div className="flex items-center space-x-2">
                {media.production_companies && media.production_companies.length > 0 ? (
                  <Avatar className="w-10 h-10 bg-primary flex items-center justify-center">
                    <AvatarImage
                      src={
                        media.production_companies[0].logo_path
                          ? `https://image.tmdb.org/t/p/w500${media.production_companies[0].logo_path}`
                          : "/placeholder-user.jpg"
                      }
                      alt={media.production_companies[0].name}
                      className="object-contain w-6 h-6 invert brightness-0"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {media.production_companies[0].name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="w-10 h-10 bg-primary flex items-center justify-center">
                    <AvatarImage
                      src="/placeholder-user.jpg"
                      alt="Channel"
                      className="object-contain w-6 h-6 invert brightness-0"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">CN</AvatarFallback>
                  </Avatar>
                )}

                <div>
                  <h2 className="font-semibold">
                    {media.production_companies && media.production_companies.length > 0
                      ? media.production_companies[0].name
                      : "Channel Name"}
                  </h2>
                </div>
              </div>
              <Button variant={isInFavorites ? "outline" : "default"} onClick={toggleFavorites}>
                {isInFavorites ? (
                  <>
                    <Heart className="h-4 w-4 mr-2 fill-current" />
                    Nos Favoritos
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar aos Favoritos
                  </>
                )}
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-700">{media.overview}</p>
            </div>

            {mediaType === "tv" && (
              <div className="mt-8 bg-secondary rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">Episódios</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {seasons.find((s) => s.season_number === selectedSeason)?.overview || "Selecione uma temporada"}
                    </p>
                  </div>

                  <Select value={selectedSeason.toString()} onValueChange={(value) => setSelectedSeason(Number(value))}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecione a temporada" />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((season) => (
                        <SelectItem key={season.id} value={season.season_number.toString()}>
                          Temporada {season.season_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="mb-6" />

                {loadingEpisodes ? (
                  <div className="text-center py-8">Carregando episódios...</div>
                ) : (
                  <div className="space-y-3">
                    {episodes.map((episode) => (
                      <div
                        key={episode.id}
                        className={`flex items-start gap-4 p-3 hover:bg-background/80 rounded-lg cursor-pointer transition-colors ${
                          selectedEpisode?.episode_number === episode.episode_number
                            ? "bg-background border-2 border-primary"
                            : ""
                        }`}
                        onClick={() => handleEpisodeSelect(episode)}
                      >
                        <div className="relative w-40 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          {episode.still_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                              alt={episode.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              Sem imagem
                            </div>
                          )}
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                            {episode.runtime || 0}min
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm line-clamp-1">
                              {episode.episode_number}. {episode.name}
                            </h4>
                            {episode.vote_average > 0 && (
                              <Badge variant="outline" className="flex-shrink-0">
                                ⭐ {episode.vote_average.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {episode.overview || "Sem descrição disponível."}
                          </p>
                          {episode.air_date && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Lançamento: {new Date(episode.air_date).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant={selectedEpisode?.episode_number === episode.episode_number ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEpisodeSelect(episode)
                          }}
                        >
                          {selectedEpisode?.episode_number === episode.episode_number ? "Assistindo" : "Assistir"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Comments</h3>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar>
                  <AvatarImage src={session?.user?.image || ""} alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <Input placeholder="Add a comment..." className="flex-grow" />
              </div>
              <div className="flex space-x-4 mt-4">
                <Avatar>
                  <AvatarImage src="https://i.imgur.com/qXRRHKA.png" alt="Commenter" />
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">
                    CriaFlix Group <span className="bg-primary rounded text-[11px] text-background p-[4px]">Admin</span>
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">
                    This feature is still being tested, wait a little longer...
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="mr-2 h-3 w-3" />
                      42
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-sm">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Recommended movieId={media.id} mediaType={mediaType} />
        </div>
      </div>
    </>
  )
}
