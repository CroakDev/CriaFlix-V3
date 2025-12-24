import type { Metadata } from "next"
import HomePageClient from "./HomePageClient"

export const metadata: Metadata = {
  title: "Home - Discover Movies & TV Series",
  description: "Browse trending movies and TV series. Get personalized recommendations and discover new content.",
  openGraph: {
    title: "Home - CriaFlix",
    description: "Browse trending movies and TV series. Get personalized recommendations and discover new content.",
    type: "website",
  },
}

export default function HomePage() {
  return <HomePageClient />
}
