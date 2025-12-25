"use client"

import { useState } from "react"
import { Play, Plus, Check, Info, ListPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AddToPlaylistDialog from "@/app/components/AddToPlaylistDialog"
import Link from "next/link"

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

  return (
    <>
      <div
        className="relative aspect-video rounded-lg overflow-visible cursor-pointer animate-in fade-in-0 zoom-in-95"
        style={{ animationDelay: `${index * 30}ms`, animationFillMode: "backwards" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Card Original - Sempre visível */}
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-muted">
          {backdropPath || posterPath ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${backdropPath || posterPath}`}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-xs text-center px-2">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Hover Overlay - Card Expandido */}
        {isHovered && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] bg-black rounded-lg shadow-2xl z-50 animate-in fade-in-0 duration-300"
            style={{ minHeight: "420px" }}
          >
            <div className="relative w-full h-[160px] rounded-t-lg overflow-hidden">
              {backdropPath || posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${backdropPath || posterPath}`}
                  alt={title}
                  className="w-full h-full object-cover animate-in zoom-in-110 duration-500"
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              {/* Logo CriaFlix no canto */}
              <div className="absolute top-2 right-2 bg-white/90 px-3 py-1 rounded text-xs font-bold text-black">
                CriaFlix
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <h3 className="font-bold text-base text-white line-clamp-2">{title}</h3>

              {/* Badge Incluso */}
              <div className="flex items-center gap-1 text-xs text-blue-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Incluso com assinatura CriaFlix</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link href={`/media/${id}?mediaType=${mediaType}`} className="flex-1">
                  <Button size="sm" className="w-full bg-white text-black hover:bg-white/90 font-semibold h-9">
                    <Play className="w-4 h-4 mr-1 fill-current" />
                    Reproduzir
                  </Button>
                </Link>

                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 h-9 w-9 rounded-full border border-white/30 text-white hover:bg-white/20 bg-black/50"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPlaylistDialog(true)
                  }}
                  title="Adicionar à Playlist"
                >
                  <ListPlus className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 h-9 w-9 rounded-full border border-white/30 text-white hover:bg-white/20 bg-black/50"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleWatchlist()
                  }}
                  title={isInWatchlist ? "Remover da Lista" : "Adicionar à Lista"}
                >
                  {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>

              {/* Info: Year, Rating */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Badge variant="destructive" className="text-xs h-5">
                  16
                </Badge>
                {year && <span>{year}</span>}
                <span className="flex items-center gap-1">
                  ⭐ {voteAverage.toFixed(1)}
                </span>
              </div>

              {/* Overview */}
              {overview && <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">{overview}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Playlist Dialog */}
      <AddToPlaylistDialog
        open={showPlaylistDialog}
        onOpenChange={setShowPlaylistDialog}
        mediaId={id}
        mediaType={mediaType}
        mediaTitle={title}
        posterPath={posterPath}
      />
    </>
  )
}