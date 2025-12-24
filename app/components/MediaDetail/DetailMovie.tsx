import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Star } from "lucide-react"
import AdvancedMediaPlayer from '../../components/Player/player'

interface MediaCardProps {
  title: string
  type: "movie" | "series"
  year: number
  duration?: string
  episodes?: number
  description: string
  genres: string[]
  rating: number
  ageRating: string
  imageUrl: string
}

const mediaData = {
  type: 'series',
  title: 'Stranger Things',
  backgroundImage: 'https://example.com/stranger-things-background.jpg',
  episodes: [
    { id: 1, title: 'Chapter One: The Vanishing of Will Byers', src: '/api/video/stranger-things-s01e01' },
    { id: 2, title: 'Chapter Two: The Weirdo on Maple Street', src: '/api/video/stranger-things-s01e02' },
    { id: 3, title: 'Chapter Three: Holly, Jolly', src: '/api/video/stranger-things-s01e03' },
  ]
}

export default function DetailMovie({ 
  title,
  type,
  year,
  duration,
  episodes,
  description,
  genres,
  rating,
  ageRating,
  imageUrl
}: MediaCardProps = {
  title: "Inception",
  type: "movie",
  year: 2010,
  duration: "2h 28min",
  description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
  genres: ["Action", "Adventure", "Sci-Fi"],
  rating: 8.8,
  ageRating: "PG-13",
  imageUrl: "/placeholder.svg?height=400&width=800"
}) {
  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg transition-all hover:shadow-xl">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      <div className="relative p-6 flex flex-col h-full justify-end space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-300">
            {year} • {type === "movie" ? duration : `${episodes} episodes`} • {ageRating}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-lg font-semibold text-white">465</span>
        </div>
        <p className="text-sm text-gray-300 line-clamp-3">{description}</p>
        <div className="flex flex-wrap gap-2">
         
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
              akaraio
            </Badge>
       
        </div>
        <Button className="w-full sm:w-auto" variant="secondary">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add to Watchlist
        </Button>
      </div>
    </div>
  )
}
