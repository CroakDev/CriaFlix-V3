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

  applicationName: "CriaFlix",

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

  manifest: "/manifest.json",

  themeColor: "#111316",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

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
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "CriaFlix - Your Streaming Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CriaFlix - Stream Movies & TV Series",
    description:
      "Discover and stream your favorite movies and TV series. Create playlists, save favorites, and get personalized recommendations.",
    images: ["/android-chrome-512x512.png"],
    creator: "@criaflix",
  },

  robots: {
    index: true,
    follow: true,
  },
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
