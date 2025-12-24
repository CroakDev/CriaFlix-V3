"use client"

import { useEffect, useState } from "react"
import { X, Play, Plus, Check, ThumbsUp, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface MovieModalProps {
    movieId: number
    type: "movie" | "tv"
    isOpen: boolean
    onClose: () => void
}

interface MovieDetails {
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
        }>
    }
}

export function MovieModal({ movieId, type, isOpen, onClose }: MovieModalProps) {
    const [details, setDetails] = useState<MovieDetails | null>(null)
    const [isInWatchlist, setIsInWatchlist] = useState(false)
    const [loading, setLoading] = useState(false)
    const [muted, setMuted] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        if (isOpen && movieId) {
            fetchDetails()
            checkWatchlist()
        }
    }, [isOpen, movieId])

    const fetchDetails = async () => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/${type}/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=videos`,
            )
            const data = await response.json()
            setDetails(data)
        } catch (error) {
            console.error("Error fetching details:", error)
        }
    }

    const checkWatchlist = async () => {
        try {
            const response = await fetch("/api/watchlist")
            const data = await response.json()

            const isInList =
                type === "movie"
                    ? data.movies?.some((m: any) => m.movieId === movieId)
                    : data.series?.some((s: any) => s.seriesId === movieId)

            setIsInWatchlist(isInList)
        } catch (error) {
            console.error("Error checking watchlist:", error)
        }
    }

    const toggleWatchlist = async () => {
        if (!details) return

        setLoading(true)
        try {
            const response = await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    id: movieId,
                    title: details.title || details.name,
                    posterPath: details.poster_path,
                }),
            })

            const data = await response.json()

            if (data.action === "added") {
                setIsInWatchlist(true)
                toast({
                    title: "Adicionado à lista",
                    description: "Item adicionado à sua watchlist",
                })
            } else {
                setIsInWatchlist(false)
                toast({
                    title: "Removido da lista",
                    description: "Item removido da sua watchlist",
                })
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível atualizar a watchlist",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen || !details) return null

    const trailer = details.videos?.results.find((video) => video.type === "Trailer" && video.site === "YouTube")

    const year = details.release_date?.split("-")[0] || details.first_air_date?.split("-")[0]
    const rating = details?.vote_average ? details.vote_average.toFixed(1) : "0.0";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div
                className="relative w-full max-w-4xl bg-zinc-900 rounded-lg overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with backdrop */}
                <div className="relative h-[400px]">
                    {trailer ? (
                        <div className="relative w-full h-full">
                            <iframe
                                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&showinfo=0&rel=0`}
                                className="w-full h-full"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent pointer-events-none" />
                        </div>
                    ) : (
                        <>
                            <img
                                src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
                                alt={details.title || details.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
                        </>
                    )}

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    {/* Mute button */}
                    {trailer && (
                        <button
                            onClick={() => setMuted(!muted)}
                            className="absolute bottom-4 right-4 p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                        </button>
                    )}

                    {/* Title and actions */}
                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-4xl font-bold text-white mb-4">{details.title || details.name}</h2>
                        <div className="flex gap-3">
                            <Button size="lg" className="bg-white text-black hover:bg-white/90">
                                <Play className="w-5 h-5 mr-2 fill-current" />
                                Assistir
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700"
                                onClick={toggleWatchlist}
                                disabled={loading}
                            >
                                {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </Button>
                            <Button size="lg" variant="outline" className="bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700">
                                <ThumbsUp className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="grid grid-cols-3 gap-8">
                        <div className="col-span-2 space-y-4">
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-green-500 font-semibold">{rating} Match</span>
                                <span className="text-zinc-400">{year}</span>
                                {details.runtime && (
                                    <span className="text-zinc-400">
                                        {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                                    </span>
                                )}
                                {details.number_of_seasons && (
                                    <span className="text-zinc-400">
                                        {details.number_of_seasons} Temporada{details.number_of_seasons > 1 ? "s" : ""}
                                    </span>
                                )}
                                <Badge variant="outline" className="border-zinc-700">
                                    HD
                                </Badge>
                            </div>

                            <p className="text-zinc-300 leading-relaxed">{details.overview || "Sem descrição disponível."}</p>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-zinc-500">Gêneros: </span>
                                <span className="text-zinc-300">{details.genres?.map((g) => g.name).join(", ") || "Desconhecido"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
