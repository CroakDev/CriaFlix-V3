const API_KEY = "3292348a48f36b094081736c090646ee";
const API_BASE = "https://api.themoviedb.org/3";



// Obtém a linguagem do localStorage, ou usa 'en-US' como padrão
const getLanguage = () => {
    const language = localStorage.getItem('locale');
    if (language === 'pt') {
      return 'pt-BR';  // Português formatado corretamente
    }
    if (language === 'en') {
      return 'en-US';  // Inglês formatado corretamente
    }
    return 'en-US';  // Valor padrão
  };

// Tipos
interface MediaItem {
    id: number;
    title?: string;           // Para filmes
    name?: string;            // Para séries de TV
    poster_path: string;
    release_date?: string;    // Para filmes
    first_air_date?: string;  // Para séries de TV
}

interface HomeListItem {
    slug: string;
    title: string;
    items: MediaItem[];
    className?: string;
}

interface ExternalIds {
    imdb_id?: string;
    facebook_id?: string;
    instagram_id?: string;
    twitter_id?: string;
}

interface MediaInfo extends MediaItem {
    externalIds: ExternalIds;
}

// Função de busca básica
const basicFetch = async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
        throw new Error('Failed to fetch data from TMDB');
    }
    const json = await response.json();
    return json;
};

// API TMDB
const TmdbApi = {
    getHomeList: async (): Promise<HomeListItem[]> => {
        const language = getLanguage();  // Obtém o idioma atual
        const fetchList = async (endpoint: string): Promise<MediaItem[]> => {
            const data = await basicFetch<{ results: MediaItem[] }>(endpoint);
            return data.results;
        };
  

        return [
            {
                slug: 'hot',
                title: 'CriaHot',
                items: await fetchList(`/trending/all/week?language=${language}&api_key=${API_KEY}`),
                className: 'title-quentes'
            },
            {
                slug: 'series',
                title: 'Series',
                items: await fetchList(`/trending/tv/week?language=${language}&api_key=${API_KEY}`),
                className: 'title-series'
            },
            {
                slug: 'originals',
                title: 'Releases',
                items: await fetchList(`/discover/movie?language=${language}&include_adult=false&include_video=false&page=1&sort_by=popularity.desc&api_key=${API_KEY}`),
                className: 'title-originals'
            },
            {
                slug: 'trending',
                title: 'Recomendados',
                items: await fetchList(`/trending/movie/week?language=${language}&api_key=${API_KEY}`),
                className: 'title-trending'
            },
            {
                slug: 'action',
                title: 'Ação',
                items: await fetchList(`/discover/movie?with_genres=28&language=${language}&api_key=${API_KEY}`)
            },
            {
                slug: 'comedy',
                title: 'Comédia',
                items: await fetchList(`/discover/movie?with_genres=35&language=${language}&api_key=${API_KEY}`)
            },
            {
                slug: 'horror',
                title: 'Terror',
                items: await fetchList(`/discover/movie?with_genres=27&language=${language}&api_key=${API_KEY}`)
            },
            {
                slug: 'romance',
                title: 'Romance',
                items: await fetchList(`/discover/movie?with_genres=10749&language=${language}&api_key=${API_KEY}`)
            }
        ];
    },

    getSimilarVideos: async (id: number, mediaType: string): Promise<MediaItem[]> => {
        const language = getLanguage();  // Obtém o idioma atual
        // Usa o mediaType para construir o endpoint correto
        const endpoint = `/${mediaType}/${id}/recommendations?language=${language}&api_key=${API_KEY}`;
        const data = await basicFetch<{ results: MediaItem[] }>(endpoint);
        return data.results;
    },

    getMediaInfo: async (mediaId: number, mediaType: 'movie' | 'tv'): Promise<MediaInfo> => {
        const language = getLanguage();  // Obtém o idioma atual
        const endpoint = mediaType === 'movie' ? `/movie/${mediaId}` : `/tv/${mediaId}`;
        const externalIdsEndpoint = `${endpoint}/external_ids`;

        const [info, externalIds] = await Promise.all([
            basicFetch<MediaItem>(`${endpoint}?language=${language}&api_key=${API_KEY}`),
            basicFetch<ExternalIds>(`${externalIdsEndpoint}?api_key=${API_KEY}`)
        ]);

        return {
            ...info,
            externalIds
        };
    }
};

export default TmdbApi;
