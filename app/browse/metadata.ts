import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/metadata"

export const metadata: Metadata = generatePageMetadata({
  title: "Browse Movies & TV Series",
  description:
    "Explore our vast collection of movies and TV series. Filter by genre, year, and rating to find your next favorite show.",
  url: "/browse",
})
