"use client"

import { useEffect, useState } from "react"
import { X, Play, Plus, Check, Volume2, VolumeX, ChevronDown, Youtube, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"
import TmdbApi from "@/lib/TmdbApi"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTranslations } from "next-intl"

interface NetflixModalProps {
  mediaId: number
  mediaType: "movie" | "tv"
  isOpen: boolean
  onClose: () => void
}

interface MediaDetails {
  id: number
  title?: string
  name?: string
  overview: string
  backdrop_path: string
  poster_path: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  runtime?: number
  number_of_seasons?: number
  genres: { id: number; name: string }[]
  videos?: {
    results: Array<{
      key: string
      type: string
      site: string
      name: string
    }>
  }
}

export function NetflixModal({ mediaId, mediaType, isOpen, onClose }: NetflixModalProps) {
  const [details, setDetails] = useState<MediaDetails | null>(null)
  const [isInFavorites, setIsInFavorites] = useState(false)
  const [loading, setLoading] = useState(false)
  const [muted, setMuted] = useState(true)
  const [showTrailerOnly, setShowTrailerOnly] = useState(false)
  const [hasAccess, setHasAccess] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const t = useTranslations("Common")

  useEffect(() => {
    if (isOpen && mediaId) {
      fetchDetails()
      checkFavorites()
      checkSubscription()
    }
  }, [isOpen, mediaId, mediaType])

  useEffect(() => {
    if (isOpen) {
      setMuted(true)
      setShowTrailerOnly(false)
    }
  }, [isOpen])

  const fetchDetails = async () => {
    try {
      const data = await TmdbApi.getMediaDetailsWithVideos(mediaId, mediaType)
      setDetails(data)
    } catch (error) {
      console.error("Error fetching details:", error)
    }
  }

  const checkFavorites = async () => {
    try {
      const response = await fetch("/api/favorites")
      const data = await response.json()

      const isInList =
        mediaType === "movie"
          ? data.movies?.some((m: any) => m.movieId === mediaId)
          : data.series?.some((s: any) => s.seriesId === mediaId)

      setIsInFavorites(isInList)
    } catch (error) {
      console.error("Error checking favorites:", error)
    }
  }

  const toggleFavorites = async () => {
    if (!details) return

    setLoading(true)
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mediaType,
          id: mediaId,
          title: details.title || details.name,
          posterPath: details.poster_path,
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
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = () => {
    if (!hasAccess) {
      toast({
        title: "Assinatura necessária",
        description: "Você precisa ser VIP para assistir este conteúdo",
        variant: "destructive",
      })
      router.push("/profile")
      return
    }
    router.push(`/media/${mediaId}?mediaType=${mediaType}`)
    onClose()
  }

  const checkSubscription = async () => {
    try {
      const res = await fetch("/api/subscription/check")
      const data = await res.json()
      setHasAccess(data.hasAccess)
    } catch (error) {
      console.error("Error checking subscription:", error)
    }
  }

  if (!isOpen) return null

  const trailer = details?.videos?.results.find(
    (video) => (video.type === "Trailer" || video.type === "Teaser") && video.site === "YouTube",
  )

  const year = details?.release_date?.split("-")[0] || details?.first_air_date?.split("-")[0]
  const rating = details?.vote_average ? details.vote_average.toFixed(1) : "0.0"

  if (showTrailerOnly && trailer) {
    return (
      <TooltipProvider>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in-0 duration-300"
          onClick={onClose}
        >
          <div
            className="relative w-full max-w-6xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-zinc-900/90 hover:bg-zinc-800 rounded-full transition-colors z-20"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <iframe
              key={`trailer-${trailer.key}-${muted}`}
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${muted ? 1 : 0}&controls=1&rel=0&modestbranding=1&fs=1`}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setMuted(!muted)}
                  className="absolute bottom-6 right-6 p-3 bg-zinc-900/90 hover:bg-zinc-800 rounded-full transition-colors border-2 border-zinc-700 z-20"
                >
                  {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{muted ? t("unmute") : t("mute")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in-0 duration-300"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] bg-zinc-900 rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {!details ? (
            <div className="aspect-video w-full flex items-center justify-center bg-zinc-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Carregando...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Video/Backdrop Section */}
              <div className="relative w-full flex-shrink-0 overflow-hidden" style={{ aspectRatio: "16/9" }}>
                {trailer ? (
                  <div className="relative w-full h-full bg-black">
                    <div className="absolute inset-0 scale-[1.15]">
                      <iframe
                        key={`${trailer.key}-${muted}`}
                        src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&showinfo=0&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3&start=0`}
                        className="w-full h-full border-0"
                        allow="autoplay; encrypted-media"
                        style={{ pointerEvents: "none" }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent pointer-events-none z-[5]" />
                    <div className="absolute inset-0 z-[6]" />
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 p-2 bg-zinc-900/90 hover:bg-zinc-800 rounded-full transition-colors z-[15]"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="absolute bottom-20 right-6 flex gap-2 z-[15]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowTrailerOnly(true)
                            }}
                            className="p-3 bg-zinc-900/90 hover:bg-zinc-800 rounded-full transition-colors border-2 border-zinc-700"
                          >
                            <Youtube className="w-5 h-5 text-white" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("watchTrailer")}</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setMuted(!muted)
                            }}
                            className="p-3 bg-zinc-900/90 hover:bg-zinc-800 rounded-full transition-colors border-2 border-zinc-700"
                          >
                            {muted ? (
                              <VolumeX className="w-5 h-5 text-white" />
                            ) : (
                              <Volume2 className="w-5 h-5 text-white" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{muted ? t("unmute") : t("mute")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-[10]">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg">
                        {details.title || details.name}
                      </h2>
                      <div className="flex gap-2 md:gap-3">
                        <Button
                          size="lg"
                          className={`font-semibold px-4 md:px-6 text-sm md:text-base ${
                            hasAccess
                              ? "bg-white text-black hover:bg-white/90"
                              : "bg-[#ffc34f] text-black hover:bg-[#ffc34f]/90"
                          }`}
                          onClick={handlePlay}
                        >
                          {hasAccess ? (
                            <>
                              <Play className="w-4 h-4 md:w-5 md:h-5 mr-2 fill-current" />
                              {t("watch")}
                            </>
                          ) : (
                            <>
                              <Crown className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                              Subscribe to Watch
                            </>
                          )}
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="lg"
                              variant="outline"
                              className="bg-zinc-800/80 border-zinc-600 hover:bg-zinc-700/80 text-white font-semibold"
                              onClick={toggleFavorites}
                              disabled={loading}
                            >
                              {isInFavorites ? (
                                <Check className="w-4 h-4 md:w-5 md:h-5" />
                              ) : (
                                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isInFavorites ? t("removeFavorites") : t("addFavorites")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Image
                      src={`https://image.tmdb.org/t/p/original${details.backdrop_path || details.poster_path}`}
                      alt={details.title || details.name || ""}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 p-2 bg-zinc-900/90 hover:bg-zinc-800 rounded-full transition-colors z-10"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg">
                        {details.title || details.name}
                      </h2>
                      <div className="flex gap-2 md:gap-3">
                        <Button
                          size="lg"
                          className={`font-semibold px-4 md:px-6 text-sm md:text-base ${
                            hasAccess
                              ? "bg-white text-black hover:bg-white/90"
                              : "bg-[#ffc34f] text-black hover:bg-[#ffc34f]/90"
                          }`}
                          onClick={handlePlay}
                        >
                          {hasAccess ? (
                            <>
                              <Play className="w-4 h-4 md:w-5 md:h-5 mr-2 fill-current" />
                              {t("watch")}
                            </>
                          ) : (
                            <>
                              <Crown className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                              Subscribe to Watch
                            </>
                          )}
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="lg"
                              variant="outline"
                              className="bg-zinc-800/80 border-zinc-600 hover:bg-zinc-700/80 text-white font-semibold"
                              onClick={toggleFavorites}
                              disabled={loading}
                            >
                              {isInFavorites ? (
                                <Check className="w-4 h-4 md:w-5 md:h-5" />
                              ) : (
                                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isInFavorites ? t("removeFavorites") : t("addFavorites")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="p-4 md:p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="md:col-span-2 space-y-3 md:space-y-4">
                    <div className="flex items-center gap-3 md:gap-4 text-sm flex-wrap">
                      <span className="text-green-500 font-bold text-lg md:text-xl">{rating}⭐</span>
                      <span className="text-zinc-400">{year}</span>
                      {details.runtime && (
                        <span className="text-zinc-400">
                          {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                        </span>
                      )}
                      {details.number_of_seasons && (
                        <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                          {details.number_of_seasons} Temporada{details.number_of_seasons > 1 ? "s" : ""}
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                        HD
                      </Badge>
                    </div>
                    <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
                      {details.overview || "Sem descrição disponível."}
                    </p>
                  </div>
                  <div className="space-y-2 md:space-y-3 text-sm">
                    <div>
                      <span className="text-zinc-500">Gêneros: </span>
                      <span className="text-zinc-300">
                        {details.genres?.map((g) => g.name).join(", ") || "Não especificado"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Tipo: </span>
                      <span className="text-zinc-300">{mediaType === "movie" ? "Filme" : "Série"}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" className="mt-6 text-zinc-400 hover:text-white w-full" onClick={handlePlay}>
                  Ver mais detalhes
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
