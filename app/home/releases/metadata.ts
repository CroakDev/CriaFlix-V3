import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/metadata"

export const metadata: Metadata = generatePageMetadata({
  title: "New Releases",
  description:
    "Discover the latest movies and TV series releases. Stay up to date with new content from the past 30 days.",
  url: "/home/releases",
})
