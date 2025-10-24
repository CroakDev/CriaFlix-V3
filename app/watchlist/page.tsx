"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Play, Info, X, Plus } from 'lucide-react'
import Image from 'next/image';

// Dummy data for the user's watchlist
const userWatchlist = [
  { id: 1, title: "Stranger Things", type: "Series", year: 2016, categories: ["Drama", "Fantasy", "Horror"], rating: 8.7, poster: "/placeholder.svg?height=300&width=200&text=Stranger+Things" },
  { id: 2, title: "Inception", type: "Movie", year: 2010, categories: ["Action", "Sci-Fi", "Thriller"], rating: 8.8, poster: "/placeholder.svg?height=300&width=200&text=Inception" },
  { id: 3, title: "Breaking Bad", type: "Series", year: 2008, categories: ["Crime", "Drama", "Thriller"], rating: 9.5, poster: "/placeholder.svg?height=300&width=200&text=Breaking+Bad" },
  { id: 4, title: "The Shawshank Redemption", type: "Movie", year: 1994, categories: ["Drama"], rating: 9.3, poster: "/placeholder.svg?height=300&width=200&text=Shawshank+Redemption" },
  { id: 5, title: "Game of Thrones", type: "Series", year: 2011, categories: ["Action", "Adventure", "Drama"], rating: 9.3, poster: "/placeholder.svg?height=300&width=200&text=Game+of+Thrones" },
]

export default function UserWatchlist() {
  const [activeTab, setActiveTab] = useState("all")
  const [watchlist, setWatchlist] = useState(userWatchlist)

  const filteredWatchlist = watchlist.filter(item => 
    activeTab === "all" || item.type.toLowerCase() === activeTab
  )

  const removeFromWatchlist = (id: number) => {
    setWatchlist(watchlist.filter(item => item.id !== id))
  }

  return (
    <div className="container mx-auto p-1 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6">Your Watchlist</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="movie">Movies</TabsTrigger>
          <TabsTrigger value="series">Series</TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredWatchlist.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden relative group">
                  <Image src="https://rollingstone.com.br/media/_versions/stranger-things-4-temporada-netflix-foto-divulgacao_widelg.jpg" width={100} height={100} alt={item.title} className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary">
                        <Play className="h-4 w-4 mr-1" /> Play
                      </Button>
                      <Button size="sm" variant="outline">
                        <Info className="h-4 w-4 mr-1" /> Info
                      </Button>
                    </div>
                  </div>
                  <Button 
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => removeFromWatchlist(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{item.title}</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">{item.year}</span>
                      <Badge variant="secondary">{item.type}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.categories.map(category => (
                        <Badge key={category} variant="outline" className="text-xs">{category}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
                      {item.rating.toFixed(1)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {filteredWatchlist.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Your watchlist is empty</h2>
          <p className="text-muted-foreground mb-6">Start adding movies and series to your watchlist!</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Browse Content
          </Button>
        </div>
      )}
    </div>
  )
}