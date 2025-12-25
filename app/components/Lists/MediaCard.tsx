"use client"

import { useState } from "react"
import { Play, Plus, Check, ListPlus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import AddToPlaylistDialog from "@/app/components/AddToPlaylistDialog"
import { NetflixModal } from "@/app/components/NetflixModal"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTranslations } from "next-intl"

interface MediaCardProps {
  id: number
  title: string
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  overview: string
  year?: string
  isInWatchlist: boolean
  onToggleWatchlist: () => void
  index: number
  mediaType?: "movie" | "tv"
}

export default function MediaCard({
  id,
  title,
  posterPath,
  backdropPath,
  voteAverage,
  overview,
  year,
  isInWatchlist,
  onToggleWatchlist,
  index,
  mediaType = "movie",
}: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false)
  const [showNetflixModal, setShowNetflixModal] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const t = useTranslations("Common")

  return (
    <TooltipProvider>
      <div
        className="group w-full flex flex-col gap-3 cursor-pointer animate-in fade-in-0 zoom-in-95"
        style={{ animationDelay: `${index * 30}ms`, animationFillMode: "backwards" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowNetflixModal(true)}
      >
        {/* Thumbnail Container */}
        <div className="block">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
            {/* Image or placeholder */}
            {backdropPath || posterPath ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer" />
                )}
                <Image
                  src={`https://image.tmdb.org/t/p/w500${backdropPath || posterPath}`}
                  alt={title}
                  fill
                  className={`object-cover transition-all duration-300 ${
                    isHovered ? "scale-105" : "scale-100"
                  } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImageLoaded(true)}
                  loading="lazy"
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-sm">No Image</span>
              </div>
            )}

            {isHovered && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 animate-in fade-in-0 duration-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-full bg-white text-black hover:bg-white/90 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowNetflixModal(true)
                      }}
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("details")}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-full border-2 border-white text-white hover:bg-white/20 bg-black/50"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onToggleWatchlist()
                      }}
                    >
                      {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isInWatchlist ? t("removeFavorites") : t("addFavorites")}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-full border-2 border-white text-white hover:bg-white/20 bg-black/50"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowPlaylistDialog(true)
                      }}
                    >
                      <ListPlus className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("addToPlaylist")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Rating badge */}
            {voteAverage > 0 && (
              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-white">{voteAverage.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content below thumbnail */}
        <div className="space-y-1 px-1">
          {/* Title */}
          <div onClick={() => setShowNetflixModal(true)}>
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {year && <span>{year}</span>}
            {year && voteAverage > 0 && <span>•</span>}
            {voteAverage > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {voteAverage.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Netflix Modal */}
      <NetflixModal
        mediaId={id}
        mediaType={mediaType}
        isOpen={showNetflixModal}
        onClose={() => setShowNetflixModal(false)}
      />

      {/* Playlist Dialog */}
      <AddToPlaylistDialog
        open={showPlaylistDialog}
        onOpenChange={setShowPlaylistDialog}
        mediaId={id}
        mediaType={mediaType}
        mediaTitle={title}
        posterPath={posterPath}
      />
    </TooltipProvider>
  )
}
