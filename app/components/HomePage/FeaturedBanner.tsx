"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Calendar, Play, Plus, Check } from "lucide-react"
import TmdbApi from "@/lib/TmdbApi"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import Image from "next/image"

interface MediaItem {
  id: number
  title?: string
  name?: string
  overview: string
  backdrop_path: string
  vote_average: number
  media_type: "movie" | "tv"
  release_date?: string
  first_air_date?: string
}

interface MediaInfo {
  runtime?: number
  episode_run_time?: number[]
  genres: { name: string }[]
}

function FeaturedBanner() {
  const [featuredMedia, setFeaturedMedia] = useState<MediaItem | null>(null)
  const [mediaDetails, setMediaDetails] = useState<MediaInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdded, setIsAdded] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const featm = useTranslations("FeaturedMidia")
  const { theme } = useTheme()

  useEffect(() => {
    const loadRandomMedia = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const homeList = await TmdbApi.getHomeList()
        const releases = homeList.find((list) => list.slug === "hot")
        if (releases && releases.items.length > 0) {
          const randomIndex = Math.floor(Math.random() * releases.items.length)
          const selectedMedia = releases.items[randomIndex] as MediaItem
          setFeaturedMedia(selectedMedia)

          const details = await TmdbApi.getMediaInfo(selectedMedia.id, selectedMedia.media_type)
          setMediaDetails(details)
        } else {
          throw new Error("No featured media available")
        }
      } catch (error) {
        console.error("Failed to load the featured media", error)
        setError("Failed to load featured content. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadRandomMedia()
  }, [])

  const handleAddToList = () => {
    setIsAdded(!isAdded)
    // Here you would typically call an API to actually add/remove the media from the user's list
  }

  if (isLoading) {
    return (
      <div className="relative h-[60vh] overflow-hidden rounded-lg mb-10 bg-secondary/10 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/50" />
        <div className="absolute bottom-0 left-0 p-8 space-y-4">
          <div className="h-8 w-64 bg-secondary/20 rounded"></div>
          <div className="h-4 w-full bg-secondary/20 rounded"></div>
          <div className="h-4 w-3/4 bg-secondary/20 rounded"></div>
          <div className="flex space-x-4">
            <div className="h-10 w-32 bg-secondary/20 rounded"></div>
            <div className="h-10 w-32 bg-secondary/20 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative h-[60vh] overflow-hidden rounded-lg mb-10 bg-secondary/10 flex items-center justify-center">
        <p className="text-center text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!featuredMedia || !mediaDetails) {
    return null
  }

  const formattedVoteAverage = featuredMedia.vote_average.toFixed(1)
  const runtime = mediaDetails.runtime
    ? `${Math.floor(mediaDetails.runtime / 60)}h ${mediaDetails.runtime % 60}m`
    : mediaDetails.episode_run_time && mediaDetails.episode_run_time.length > 0
      ? `${mediaDetails.episode_run_time[0]}m per episode`
      : "Unknown"
  const genres = mediaDetails.genres.map((genre) => genre.name)
  const releaseYear = featuredMedia.release_date
    ? new Date(featuredMedia.release_date).getFullYear()
    : featuredMedia.first_air_date
      ? new Date(featuredMedia.first_air_date).getFullYear()
      : "Unknown"

  return (
    <AnimatePresence>
      <motion.section
        className="relative h-[60vh] overflow-hidden rounded-lg mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {featuredMedia.backdrop_path && (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: imageLoaded ? 1 : 1.1 }}
            transition={{ duration: 10, ease: "linear" }}
          >
            <Image
              src={`https://image.tmdb.org/t/p/original${featuredMedia.backdrop_path}`}
              alt={featuredMedia.title || featuredMedia.name || "Featured media"}
              layout="fill"
              objectFit="cover"
              className={`transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              priority
            />
          </motion.div>
        )}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-t ${
            theme === "dark" ? "from-background/90 to-background/30" : "from-white/90 to-white/30"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
          <motion.h2
            className="text-4xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {featuredMedia.title || featuredMedia.name}
          </motion.h2>
          <motion.p
            className="text-sm text-muted-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {featuredMedia.overview || "No description available."}
          </motion.p>
          <motion.div
            className="flex flex-wrap items-center gap-4 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-wrap gap-2">
              {genres.map((genre, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-primary/10 text-primary backdrop-blur-md rounded-sm border-none"
                >
                  {genre}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-primary text-sm flex items-center bg-primary/10 px-2 py-1 backdrop-blur-md rounded-sm border-none">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                {formattedVoteAverage}
              </span>
              <span className="text-primary text-sm flex items-center bg-primary/10 px-2 py-1 backdrop-blur-md rounded-sm border-none">
                <Clock className="h-4 w-4 mr-1" />
                {runtime}
              </span>
              <span className="text-primary text-sm flex items-center bg-primary/10 px-2 py-1 backdrop-blur-md rounded-sm border-none">
                <Calendar className="h-4 w-4 mr-1" />
                {releaseYear}
              </span>
            </div>
          </motion.div>
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href={`/media/${featuredMedia.id}?mediaType=${featuredMedia.media_type}`} className="block group">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 flex items-center">
                <Play className="mr-2 h-4 w-4" /> {featm("btwath")}
              </Button>
            </Link>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="secondary"
                className="transition-colors duration-300 flex items-center bg-gray-400/15 backdrop-blur-sm border-gray-400"
                onClick={handleAddToList}
              >
                {isAdded ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> {featm("btadded")}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> {featm("btaddwl")}
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </AnimatePresence>
  )
}

export default FeaturedBanner
