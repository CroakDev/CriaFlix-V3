"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MediaCard from "../components/Lists/MediaCard"

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "3292348a48f36b094081736c090646ee"

interface Media {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  overview: string
  genre_ids: number[]
  release_date?: string
  first_air_date?: string
}

const MOVIE_GENRES = [
  { id: 28, name: "Ação" },
  { id: 12, name: "Aventura" },
  { id: 16, name: "Animação" },
  { id: 35, name: "Comédia" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentário" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Família" },
  { id: 14, name: "Fantasia" },
  { id: 36, name: "História" },
  { id: 27, name: "Terror" },
  { id: 10402, name: "Música" },
  { id: 9648, name: "Mistério" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Ficção Científica" },
  { id: 10770, name: "Cinema TV" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "Guerra" },
  { id: 37, name: "Faroeste" },
]

const TV_GENRES = [
  { id: 10759, name: "Ação & Aventura" },
  { id: 16, name: "Animação" },
  { id: 35, name: "Comédia" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentário" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Família" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mistério" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "Guerra & Política" },
  { id: 37, name: "Faroeste" },
]

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<"movies" | "series">("movies")
  const [media, setMedia] = useState<Media[]>([])
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([])
  const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("popularity")
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  const currentGenres = activeTab === "movies" ? MOVIE_GENRES : TV_GENRES
  const currentYears = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString())

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!session) return

      try {
        const response = await fetch("/api/watchlist")
        const data = await response.json()

        const ids = new Set<number>()
        data.movies?.forEach((m: any) => ids.add(m.movieId))
        data.series?.forEach((s: any) => ids.add(s.seriesId))

        setWatchlistIds(ids)
      } catch (error) {
        console.error("Error fetching watchlist:", error)
      }
    }

    fetchWatchlist()
  }, [session])

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true)
      try {
        const endpoint = activeTab === "movies" ? "movie" : "tv"
        const sortParam =
          sortBy === "popularity" ? "popularity.desc" : sortBy === "rating" ? "vote_average.desc" : "release_date.desc"

        let url = `https://api.themoviedb.org/3/discover/${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=${sortParam}&include_adult=false&page=1`

        if (selectedGenre !== "all") {
          url += `&with_genres=${selectedGenre}`
        }

        if (selectedYear !== "all") {
          const yearParam = activeTab === "movies" ? "primary_release_year" : "first_air_date_year"
          url += `&${yearParam}=${selectedYear}`
        }

        const response = await fetch(url)
        const data = await response.json()
        setMedia(data.results || [])
        setFilteredMedia(data.results || [])
      } catch (error) {
        console.error("Error fetching media:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar o conteúdo",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [activeTab, selectedGenre, selectedYear, sortBy])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMedia(media)
      return
    }

    const searchMedia = async () => {
      setLoading(true)
      try {
        const endpoint = activeTab === "movies" ? "movie" : "tv"
        const response = await fetch(
          `https://api.themoviedb.org/3/search/${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(searchQuery)}&page=1`,
        )
        const data = await response.json()
        setFilteredMedia(data.results || [])
      } catch (error) {
        console.error("Error searching:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchMedia, 500)
    return () => clearTimeout(debounce)
  }, [searchQuery, activeTab])

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

  const clearFilters = () => {
    setSelectedGenre("all")
    setSelectedYear("all")
    setSortBy("popularity")
    setSearchQuery("")
  }

  const hasActiveFilters =
    selectedGenre !== "all" || selectedYear !== "all" || sortBy !== "popularity" || searchQuery !== ""

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container mx-auto px-2 sm:px-4 py-4 space-y-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-bold">Navegar</h1>

            <div className="flex items-center gap-2">
              <div className="relative w-full max-w-[200px] sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Buscar...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              <Button
                variant={showFilters ? "default" : "outline"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "movies" | "series")} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="movies">Filmes</TabsTrigger>
              <TabsTrigger value="series">Séries</TabsTrigger>
            </TabsList>
          </Tabs>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg animate-in slide-in-from-top-2">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os gêneros</SelectItem>
                  {currentGenres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id.toString()}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {currentYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularidade</SelectItem>
                  <SelectItem value="rating">Avaliação</SelectItem>
                  <SelectItem value="release">Lançamento</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xl text-muted-foreground mb-2">Nenhum resultado encontrado</p>
            <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou buscar por outro termo</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-8">
            {filteredMedia.map((item, index) => {
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
