"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, Filter, Star, X } from 'lucide-react'
import Image from 'next/image';

const categories = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Romance', 'Thriller', 'Horror', 'Fantasy', 'Adventure', 'Animation']
const types = ['Series', 'Film', 'Anime']

const dummyMedia = [
  { id: 1, title: "Stranger Things", type: "Series", year: 2016, categories: ["Drama", "Fantasy", "Horror"], rating: 8.7 },
  { id: 2, title: "Inception", type: "Film", year: 2010, categories: ["Action", "Sci-Fi", "Thriller"], rating: 8.8 },
  { id: 3, title: "Attack on Titan", type: "Anime", year: 2013, categories: ["Action", "Fantasy", "Drama"], rating: 9.0 },
  { id: 4, title: "The Crown", type: "Series", year: 2016, categories: ["Drama", "History"], rating: 8.6 },
  { id: 5, title: "Parasite", type: "Film", year: 2019, categories: ["Comedy", "Drama", "Thriller"], rating: 8.6 },
  { id: 6, title: "Death Note", type: "Anime", year: 2006, categories: ["Mystery", "Thriller", "Supernatural"], rating: 9.0 },
  { id: 7, title: "Breaking Bad", type: "Series", year: 2008, categories: ["Crime", "Drama", "Thriller"], rating: 9.5 },
  { id: 8, title: "The Matrix", type: "Film", year: 1999, categories: ["Action", "Sci-Fi"], rating: 8.7 },
  { id: 9, title: "Fullmetal Alchemist: Brotherhood", type: "Anime", year: 2009, categories: ["Action", "Adventure", "Fantasy"], rating: 9.1 },
  { id: 10, title: "Black Mirror", type: "Series", year: 2011, categories: ["Drama", "Sci-Fi", "Thriller"], rating: 8.8 },
]

export default function ModernMediaBrowser() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [yearRange, setYearRange] = useState([1900, new Date().getFullYear()])
  const [minRating, setMinRating] = useState(0)
  const [filteredMedia, setFilteredMedia] = useState(dummyMedia)
  const [activeTab, setActiveTab] = useState("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    const filtered = dummyMedia.filter(item => 
      (searchTerm === "" || item.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategories.length === 0 || selectedCategories.some(cat => item.categories.includes(cat))) &&
      (selectedTypes.length === 0 || selectedTypes.includes(item.type)) &&
      item.year >= yearRange[0] && item.year <= yearRange[1] &&
      item.rating >= minRating &&
      (activeTab === "all" || item.type.toLowerCase() === activeTab)
    )
    setFilteredMedia(filtered)
  }, [searchTerm, selectedCategories, selectedTypes, yearRange, minRating, activeTab])

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedTypes([])
    setYearRange([1900, new Date().getFullYear()])
    setMinRating(0)
  }

  return (
    <div className="container mx-auto p-1 bg-background text-foreground">

      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow relative">
          <Input
            type="text"
            placeholder="Search titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        </div>
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Refine Your Search</h2>
                <Button variant="ghost" onClick={clearFilters} className="text-sm">
                  Clear All
                </Button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Categories</h3>
                  <ScrollArea className="h-[200px]">
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map(category => (
                        <div key={category} className="flex items-center">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              setSelectedCategories(
                                checked
                                  ? [...selectedCategories, category]
                                  : selectedCategories.filter((c) => c !== category)
                              )
                            }}
                          />
                          <label htmlFor={category} className="ml-2 text-sm">{category}</label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {types.map(type => (
                      <div key={type} className="flex items-center">
                        <Checkbox
                          id={type}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            setSelectedTypes(
                              checked
                                ? [...selectedTypes, type]
                                : selectedTypes.filter((t) => t !== type)
                            )
                          }}
                        />
                        <label htmlFor={type} className="ml-2 text-sm">{type}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Year Range</h3>
                  <Slider
                    min={1900}
                    max={new Date().getFullYear()}
                    step={1}
                    value={yearRange}
                    onValueChange={setYearRange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{yearRange[0]}</span>
                    <span>{yearRange[1]}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Minimum Rating</h3>
                  <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select minimum rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>{rating.toFixed(1)}+</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="series">Series</TabsTrigger>
          <TabsTrigger value="film">Films</TabsTrigger>
          <TabsTrigger value="anime">Anime</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMedia.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden">
              <Image src={`https://rollingstone.com.br/media/_versions/stranger-things-4-temporada-netflix-foto-divulgacao_widelg.jpg`} alt={item.title} className="w-full h-40 object-cover" />
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
      </div>
    </div>
  )
}