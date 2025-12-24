import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/metadata"

export const metadata: Metadata = generatePageMetadata({
  title: "My Playlists",
  description: "Create and manage your custom playlists. Organize your favorite movies and series your way.",
  url: "/playlists",
})
