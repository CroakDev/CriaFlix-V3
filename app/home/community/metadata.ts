import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/metadata"

export const metadata: Metadata = generatePageMetadata({
  title: "Community Playlists",
  description:
    "Explore public playlists created by the CriaFlix community. Discover curated collections of great content.",
  url: "/home/community",
})
