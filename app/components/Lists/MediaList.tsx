"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import TmdbApi from "@/lib/TmdbApi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Plus, Info } from "lucide-react"
import PlaylistDropdown from "@/app/components/PlaylistDropdown"

interface MediaItem {
  id: number
  title?: string
  name?: string
  backdrop_path: string
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
  const [hoveredId, setHoveredId] = useState<number | null>(null)

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
  const MediaItemComponent = ({ media }: { media: any }) => {
    const [isHovered, setIsHovered] = useState(false)
    const hoverRef = useRef<HTMLDivElement>(null)

    const title = media.title || media.name || "Título não disponível"
    const year = (media.release_date || media.first_air_date || "")?.substring(0, 4)

    return (
      <div
        className="relative w-full overflow-visible"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={(e) => {
          // se o mouse ainda estiver dentro do card ou da área invisível, não desativa o hover
          if (hoverRef.current && hoverRef.current.contains(e.relatedTarget as Node)) return
          setIsHovered(false)
        }}
      >
        {/* Card base */}
        <Link
          href={`/media/${media.id}?mediaType=${media.media_type ?? "movie"}`}
          className="block group"
        >
          <div className="relative aspect-video rounded-md overflow-hidden mb-2">
            <Image
              src={
                media.backdrop_path
                  ? `https://image.tmdb.org/t/p/w500${media.backdrop_path}`
                  : "https://iseb3.com.br/assets/camaleon_cms/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef.png"
              }
              alt={title}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {title}
            </h3>
            <p className="text-xs text-zinc-900 dark:text-white dark:text-opacity-[0.6]">
              {media.media_type === "tv" ? "Série" : "Filme"} • {year}
            </p>
          </div>
        </Link>

        {/* Card de detalhes com área de segurança invisível */}
        <div
          ref={hoverRef}
          onMouseLeave={(e) => {
            // só fecha se o mouse realmente sair da área toda (card + zona de segurança)
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsHovered(false)
            }
          }}
          className="absolute top-0  z-50"
          style={{ pointerEvents: isHovered ? "auto" : "none" }}
        >
          <motion.div
            initial={{ opacity: 0, scaleY: 0.8 }}
            animate={
              isHovered
                ? { opacity: 1, scaleY: 1 }
                : { opacity: 0, scaleY: 0.8 }
            }
            transition={{ duration: 0.19, ease: "easeOut" }}
            style={{
              width: "280px",
              minHeight: "420px",
              transformOrigin: "top center",
            }}
            className="relative bg-background border border-border/50 rounded-lg shadow-2xl"
          >
            {/* Imagem topo */}
            <div className="relative w-full h-[160px] rounded-t-lg overflow-hidden cursor-pointer">
              <Image
                src={
                  media.backdrop_path
                    ? `https://image.tmdb.org/t/p/w500${media.backdrop_path}`
                    : "https://iseb3.com.br/assets/camaleon_cms/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef.png"
                }
                alt={title}
                fill
                loading="lazy"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute top-2 right-2 bg-primary/40 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold text-white">
                CriaFlix
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-base line-clamp-2">{title}</h3>

              <div className="flex items-center gap-1 text-xs text-primary">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Incluso com assinatura CriaFlix</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/media/${media.id}?mediaType=${media.media_type ?? "movie"}`}
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    className="w-full bg-white text-black hover:bg-white/90 font-semibold h-9"
                  >
                    <Play className="w-4 h-4 mr-1 fill-current" />
                    Reproduzir
                  </Button>
                </Link>

                <PlaylistDropdown
                  mediaId={media.id}
                  mediaType={media.media_type === "tv" ? "tv" : "movie"}
                  mediaTitle={title}
                  posterPath={media.backdrop_path}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                {year && <span>{year}</span>}
                <span>{media.media_type === "tv" ? "Série" : "Filme"}</span>
              </div>

              {media.overview && (
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {media.overview}
                </p>
              )}
            </div>
          </motion.div>

          {/* Zona invisível abaixo do card — evita que o mouse saia acidentalmente */}
          <div className="absolute top-full left-0 w-full h-6 bg-transparent" />
        </div>
      </div>
    )
  }



  return (
    <div className="w-full space-y-8 py-6 px-4 pt-1">
      {isLoading ? (
        <div className="space-y-8">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-7 w-40" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {list.items.slice(0, 12).map((media) => (
                <MediaItemComponent key={media.id} media={media} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
