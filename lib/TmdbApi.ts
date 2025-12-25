const API_KEY = "3292348a48f36b094081736c090646ee"
const API_BASE = "https://api.themoviedb.org/3"

// Obtém a linguagem do localStorage, ou usa 'en-US' como padrão
const getLanguage = () => {
  const language = localStorage.getItem("locale")
  if (language === "pt") {
    return "pt-BR"
  }
  if (language === "en") {
    return "en-US"
  }
  return "en-US"
}

// Tipos
interface MediaItem {
  id: number
  title?: string
  name?: string
  poster_path: string
  release_date?: string
  first_air_date?: string
}

interface HomeListItem {
  slug: string
  title: string
  items: MediaItem[]
  className?: string
}

interface ExternalIds {
  imdb_id?: string
  facebook_id?: string
  instagram_id?: string
  twitter_id?: string
}

interface MediaInfo extends MediaItem {
  externalIds: ExternalIds
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

// Função de busca básica
const basicFetch = async (endpoint: string): Promise<any> => {
  const response = await fetch(`${API_BASE}${endpoint}`)
  if (!response.ok) {
    throw new Error("Failed to fetch data from TMDB")
  }
  const json = await response.json()
  return json
}

// API TMDB
const TmdbApi = {
  getHomeList: async (): Promise<HomeListItem[]> => {
    const language = getLanguage() // Obtém o idioma atual
    const fetchList = async (endpoint: string): Promise<MediaItem[]> => {
      const data = await basicFetch(`${endpoint}`)
      return data.results
    }

    return [
      {
        slug: "hot",
        title: "CriaHot",
        items: await fetchList(`/trending/all/week?language=${language}&api_key=${API_KEY}`),
        className: "title-quentes",
      },
      {
        slug: "series",
        title: "Series",
        items: await fetchList(`/trending/tv/week?language=${language}&api_key=${API_KEY}`),
        className: "title-series",
      },
      {
        slug: "originals",
        title: "Releases",
        items: await fetchList(
          `/discover/movie?language=${language}&include_adult=false&include_video=false&page=1&sort_by=popularity.desc&api_key=${API_KEY}`,
        ),
        className: "title-originals",
      },
      {
        slug: "trending",
        title: "Recomendados",
        items: await fetchList(`/trending/movie/week?language=${language}&api_key=${API_KEY}`),
        className: "title-trending",
      },
      {
        slug: "action",
        title: "Ação",
        items: await fetchList(`/discover/movie?with_genres=28&language=${language}&api_key=${API_KEY}`),
      },
      {
        slug: "comedy",
        title: "Comédia",
        items: await fetchList(`/discover/movie?with_genres=35&language=${language}&api_key=${API_KEY}`),
      },
      {
        slug: "horror",
        title: "Terror",
        items: await fetchList(`/discover/movie?with_genres=27&language=${language}&api_key=${API_KEY}`),
      },
      {
        slug: "romance",
        title: "Romance",
        items: await fetchList(`/discover/movie?with_genres=10749&language=${language}&api_key=${API_KEY}`),
      },
    ]
  },

  getSimilarVideos: async (id: number, mediaType: string): Promise<MediaItem[]> => {
    const language = getLanguage() // Obtém o idioma atual
    // Usa o mediaType para construir o endpoint correto
    const endpoint = `/${mediaType}/${id}/recommendations?language=${language}&api_key=${API_KEY}`
    const data = await basicFetch(endpoint)
    return data.results
  },

  getMediaInfo: async (mediaId: number, mediaType: "movie" | "tv"): Promise<MediaInfo> => {
    const language = getLanguage() // Obtém o idioma atual
    const endpoint = mediaType === "movie" ? `/movie/${mediaId}` : `/tv/${mediaId}`
    const externalIdsEndpoint = `${endpoint}/external_ids`

    const [info, externalIds] = await Promise.all([
      basicFetch(`${endpoint}?language=${language}&api_key=${API_KEY}`),
      basicFetch(`${externalIdsEndpoint}?api_key=${API_KEY}`),
    ])

    return {
      ...info,
      externalIds,
    }
  },

  getSeasons: async (seriesId: number): Promise<Season[]> => {
    const language = getLanguage()
    const endpoint = `/tv/${seriesId}?language=${language}&api_key=${API_KEY}`
    const data = await basicFetch(endpoint)
    return data.seasons || []
  },

  getSeasonEpisodes: async (seriesId: number, seasonNumber: number): Promise<Episode[]> => {
    const language = getLanguage()
    const endpoint = `/tv/${seriesId}/season/${seasonNumber}?language=${language}&api_key=${API_KEY}`
    const data = await basicFetch(endpoint)
    return data.episodes || []
  },

  getEpisodeDetails: async (seriesId: number, seasonNumber: number, episodeNumber: number): Promise<Episode> => {
    const language = getLanguage()
    const endpoint = `/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}?language=${language}&api_key=${API_KEY}`
    return await basicFetch(endpoint)
  },

  getMediaDetailsWithVideos: async (mediaId: number, mediaType: "movie" | "tv"): Promise<any> => {
    const language = getLanguage()
    const endpoint = mediaType === "movie" ? `/movie/${mediaId}` : `/tv/${mediaId}`
    const data = await basicFetch(
      `${endpoint}?api_key=${API_KEY}&append_to_response=videos,credits&language=${language}`,
    )
    return data
  },
}

export default TmdbApi
