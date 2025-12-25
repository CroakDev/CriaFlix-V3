"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import TmdbApi from "@/lib/TmdbApi"
import { useSearchParams } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { useSession } from "next-auth/react"
import Recommended from "@/app/components/Lists/Recommended"
import ServerSelection from "../../components/Player/player"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale" // Para exibir em português

interface MediaInfo {
  id: number
  title?: string
  name?: string
  backdrop_path?: string
  overview?: string
  release_date?: string
  first_air_date?: string
  production_companies?: {
    logo_path?: string
    name: string
  }[]
  externalIds: {
    imdb_id?: string
    facebook_id?: string
    instagram_id?: string
    twitter_id?: string
  }
  revenue?: number // Adicionando a propriedade revenue
}

export default function MediaDetailPage({ params }: { params: { id: string } }) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [media, setMedia] = useState<MediaInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession() // Obtém a sessão do usuário

  const searchParams = useSearchParams()
  const mediaType = searchParams.get("mediaType") || "movie" // Captura o mediaType da query string, padrão 'movie' se não estiver presente

  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        const mediaId = Number.parseInt(params.id)
        if (isNaN(mediaId)) {
          throw new Error("Invalid media ID")
        }

        console.log(`Fetching media details for ID: ${mediaId}, Type: ${mediaType}`)

        const data = await TmdbApi.getMediaInfo(mediaId, mediaType as "movie" | "tv")
        setMedia(data)

        console.log("Exibição: " + JSON.stringify(data, null, 2)) // O segundo argumento formata a saída para melhor legibilidade

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching media details:", error)
        setError("Error fetching media details")
        setIsLoading(false)
      }
    }

    fetchMediaDetails()
  }, [params.id, mediaType])

  if (isLoading) return <div>Loading...</div>

  if (error) return <div>{error}</div>

  if (!media) return <div>Media not found</div>

  const serverData = media
    ? {
      backgroundImage: `https://image.tmdb.org/t/p/w500${media.backdrop_path}`,
      servers: [
        {
          id: "server1",
          name: "SuperFlix",
          url: `https://superflixapi.asia/filme/${media.externalIds.imdb_id}#colorA36AF9#noLink`,
          country: "BR",
          premium: false,
        },
        {
          id: "server2",
          name: "Warez",
          url: `https://embed.warezcdn.link/filme/${media.externalIds.imdb_id}#colorA36AF9#noLink`,
          country: "BR",
          premium: false,
        },
        {
          id: "server3",
          name: "GoApi",
          url: `https://gofilmes.me/play/w2.php?TXRjbUdBVGR4a3ZTbFM4U0ZSZmVHUT09`,
          country: "BR",
          premium: true,
        }, // Mudança de string para boolean
        {
          id: "server4",
          name: "VidSrc",
          url: `https://vidsrc.me/embed/movie/${media.id}`,
          country: "US",
          premium: false,
        },
        {
          id: "server5",
          name: "Servidor Alpha",
          url: `https://spencerdevs.xyz/movie/${media.externalIds.imdb_id}#colorA36AF9#noLink`,
          country: "US",
          premium: false,
        },
        {
          id: "server6",
          name: "Servidor 5",
          url: "https://example.com/embed/server5",
          country: "DE",
          premium: false,
        },
      ],
    }
    : {
      backgroundImage: "https://example.com/background-image.jpg",
      servers: [],
    }

  return (
    <div className="container mx-auto px-2 sm:px-4 max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="lg:col-span-2 xl:col-span-3">
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
            <ServerSelection {...serverData} />
          </div>
          <h1 className="text-2xl font-bold mt-4">{media.title || media.name}</h1>
          <div className="flex flex-wrap items-center justify-between ">
            <p className="text-gray-500 text-sm">
              {media.revenue?.toLocaleString("en-US")} views •
              <span className="ml-1">
                {media.release_date || media.first_air_date
                  ? formatDistanceToNow(new Date(media.release_date || (media.first_air_date as string)), {
                    locale: ptBR,
                    addSuffix: true,
                  })
                  : "Data não disponível"}
              </span>
            </p>
            <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
              <Button variant="ghost" size="sm">
                <ThumbsUp className="mr-2 h-4 w-4" />
                +1k
              </Button>
              <Button variant="ghost" size="sm">
                <ThumbsDown className="mr-2 h-4 w-4" />
                Dislike
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className=" h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pb-4 border-b">
            <div className="flex items-center space-x-2">
              {media.production_companies && media.production_companies.length > 0 ? (
                <Avatar className="w-10 h-10 bg-primary flex items-center justify-center">
                  <AvatarImage
                    src={
                      media.production_companies[0].logo_path
                        ? `https://image.tmdb.org/t/p/w500${media.production_companies[0].logo_path}`
                        : "/placeholder-user.jpg"
                    }
                    alt={media.production_companies[0].name}
                    className="object-contain w-6 h-6 invert brightness-0"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {media.production_companies[0].name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-10 h-10 bg-primary flex items-center justify-center">
                  <AvatarImage
                    src="/placeholder-user.jpg"
                    alt="Channel"
                    className="object-contain w-6 h-6 invert brightness-0"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    CN
                  </AvatarFallback>
                </Avatar>
              )}



              <div>
                <h2 className="font-semibold">
                  {media.production_companies && media.production_companies.length > 0
                    ? media.production_companies[0].name
                    : "Channel Name"}
                </h2>
              </div>
            </div>
            <Button variant={isSubscribed ? "outline" : "default"} onClick={() => setIsSubscribed(!isSubscribed)}>
              {isSubscribed ? "On the list" : "Add to Whatchlist"}
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-700">{media.overview}</p>
          </div>

          {/* Playlist/Series Section */}
          {mediaType === "tv" ? (
            <div className="mt-8 bg-secondary rounded-lg p-4">
              <h3 className="text-xl font-semibold">Episodes Temp 1</h3>
              <h4 className="mb-4 text-sm text-zinc-500">description temp for serie</h4>
              <Separator />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-2 hover:bg-background rounded-md cursor-pointer"
                  >
                    <Image
                      src="https://p2.trrsf.com/image/fget/cf/774/0/images.terra.com/2024/05/08/115141614-i657051.jpeg"
                      className="w-28 rounded-lg"
                      objectFit="cover"
                      width={100}
                      height={100}
                      alt="ImageEpisode"
                    />

                    <div>
                      <p className="font-medium">
                        Episode {index}: {index === 1 ? "Big Buck Bunny" : `Animated Short ${index}`}
                        <br />
                        <span className="text-sm text-zinc-500">
                          When a deliciously wicked prank gets Wednesday expelled, her parents ship her off to Nevermore
                          Academy, the boarding school where they fell in love.
                        </span>
                      </p>

                      <Badge className="bg-background text-zinc-950 dark:text-gray-500 rounded-sm hover:bg-background">
                        13:30
                      </Badge>
                      <Badge className="ml-2 rounded-sm">New</Badge>
                    </div>
                    <Button className="bg-background text-white">Play</Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar>
                <AvatarImage src={session?.user?.image || ""} alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Input placeholder="Add a comment..." className="flex-grow" />
            </div>
            {/* Sample comment */}
            <div className="flex space-x-4 mt-4">
              <Avatar>
                <AvatarImage src="https://i.imgur.com/qXRRHKA.png" alt="Commenter" />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">
                  CriaFlix Group <span className="bg-primary rounded text-[11px] text-background p-[4px]">Admin</span>
                </h4>
                <p className="text-sm text-gray-400 mt-1">
                  This feature is still being tested, wait a little longer...
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="mr-2 h-3 w-3" />
                    42
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-sm">
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Recommended movieId={media.id} mediaType={mediaType} />
      </div>
    </div>
  )
}
