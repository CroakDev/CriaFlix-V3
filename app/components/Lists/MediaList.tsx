'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import TmdbApi from '@/lib/TmdbApi'
import { Button } from "@/components/ui/button"

interface MediaItem {
  id: number
  title?: string
  name?: string
  backdrop_path: string
  release_date?: string
  first_air_date?: string
  media_type: 'movie' | 'tv';
}

interface HomeListItem {
  slug: string
  title: string
  items: MediaItem[]
}

export default function MediaList() {
  const [lists, setLists] = useState<HomeListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const MediaItemComponent = ({ media }: { media: MediaItem }) => (
    <motion.div className="w-full" transition={{ duration: 0.2 }}>
     <Link href={`/media/${media.id}?mediaType=${media.media_type ?? 'movie'}`} className="block group">
        <div className="relative aspect-video rounded-md overflow-hidden mb-2">
          <Image
            src={media.backdrop_path ? `https://image.tmdb.org/t/p/w500${media.backdrop_path}` : 'https://iseb3.com.br/assets/camaleon_cms/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef.png'}
            alt={media.title || media.name || 'Media Poster'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            object-fit="cover"
            className="transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
            <Button variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Play</Button>
          </div>
        </div>
        <div className="flex space-x-2">
          <div>
            <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {media.title || media.name || 'Title not available'}
            </h3>
            <p className="text-xs text-zinc-900 dark:text-white dark:text-opacity-[0.6]">
              {media.media_type === 'tv' ? 'Serie' : 'Movie'} • {(media.release_date || media.first_air_date || 'Date not available')?.substring(0, 4)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );

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
