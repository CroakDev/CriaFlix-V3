import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import AppProviders from "./providers"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "CriaFlix - Stream Movies & TV Series",
    template: "%s | CriaFlix",
  },
  description:
    "Discover and stream your favorite movies and TV series. Create playlists, save favorites, and get personalized recommendations on CriaFlix.",
  keywords: [
    "streaming",
    "movies",
    "tv series",
    "entertainment",
    "playlists",
    "watch online",
    "CriaFlix",
    "filmes",
    "séries",
  ],
  authors: [{ name: "CriaFlix Team" }],
  creator: "CriaFlix",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://criaflix.com",
    title: "CriaFlix - Stream Movies & TV Series",
    description:
      "Discover and stream your favorite movies and TV series. Create playlists, save favorites, and get personalized recommendations.",
    siteName: "CriaFlix",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CriaFlix - Your Streaming Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CriaFlix - Stream Movies & TV Series",
    description:
      "Discover and stream your favorite movies and TV series. Create playlists, save favorites, and get personalized recommendations.",
    images: ["/twitter-image.jpg"],
    creator: "@criaflix",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
        <Toaster />
      </body>
    </html>
  )
}
