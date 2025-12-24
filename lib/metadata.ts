import type { Metadata } from "next"

interface GenerateMetadataProps {
  title: string
  description: string
  image?: string
  type?: "website" | "article" | "video.movie" | "video.tv_show"
  url?: string
}

export function generatePageMetadata({
  title,
  description,
  image = "/og-image.jpg",
  type = "website",
  url,
}: GenerateMetadataProps): Metadata {
  const fullTitle = `${title} | CriaFlix`
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://criaflix.com"
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type,
      url: fullUrl,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: "CriaFlix",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@criaflix",
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}

export function generateMediaMetadata(
  mediaType: "movie" | "tv",
  id: number,
  title: string,
  overview: string,
  posterPath?: string,
  backdropPath?: string,
): Metadata {
  const imageUrl = backdropPath
    ? `https://image.tmdb.org/t/p/w1280${backdropPath}`
    : posterPath
      ? `https://image.tmdb.org/t/p/w780${posterPath}`
      : "/og-image.jpg"

  const fullTitle = `${title} - Watch ${mediaType === "movie" ? "Movie" : "Series"}`
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://criaflix.com"
  const fullUrl = `${baseUrl}/media/${id}?mediaType=${mediaType}`

  return {
    title: fullTitle,
    description: overview || `Watch ${title} on CriaFlix. Stream in HD quality with subtitles.`,
    openGraph: {
      title: fullTitle,
      description: overview || `Watch ${title} on CriaFlix. Stream in HD quality with subtitles.`,
      type: mediaType === "movie" ? "video.movie" : "video.tv_show",
      url: fullUrl,
      images: [
        {
          url: imageUrl,
          width: 1280,
          height: 720,
          alt: title,
        },
      ],
      siteName: "CriaFlix",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: overview || `Watch ${title} on CriaFlix. Stream in HD quality with subtitles.`,
      images: [imageUrl],
      creator: "@criaflix",
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}

export function generatePlaylistMetadata(
  id: number,
  title: string,
  description: string | null,
  itemCount: number,
  isPublic: boolean,
): Metadata {
  const fullTitle = `${title} - Playlist`
  const fullDescription = description || `A playlist with ${itemCount} ${itemCount === 1 ? "item" : "items"}`
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://criaflix.com"
  const fullUrl = `${baseUrl}/playlists/${id}`

  return {
    title: fullTitle,
    description: fullDescription,
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      type: "website",
      url: fullUrl,
      images: [
        {
          url: "/og-playlist.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: "CriaFlix",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: ["/og-playlist.jpg"],
      creator: "@criaflix",
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: isPublic,
      follow: isPublic,
    },
  }
}
