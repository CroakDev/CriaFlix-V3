import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/metadata"

export const metadata: Metadata = generatePageMetadata({
  title: "Watch Later",
  description: "Your watch later list. Save movies and series to watch when you have time.",
  url: "/watch-later",
})
