import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/metadata"

export const metadata: Metadata = generatePageMetadata({
  title: "Made For You",
  description: "Get personalized movie and TV series recommendations based on your favorites and watch history.",
  url: "/home/made-for-you",
})
