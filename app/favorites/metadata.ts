import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/metadata"

export const metadata: Metadata = generatePageMetadata({
  title: "My Favorites",
  description: "Access your favorite movies and TV series. Keep track of content you love in one convenient place.",
  url: "/favorites",
})
