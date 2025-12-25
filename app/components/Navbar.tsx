"use client"

import { CommandEmpty } from "@/components/ui/command"
import { CommandList } from "@/components/ui/command"
import { CommandInput } from "@/components/ui/command"
import { CommandDialog } from "@/components/ui/command"
import { useCallback } from "react"
import { useEffect } from "react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Crown, Loader2 } from "lucide-react"
import * as React from "react"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useContext } from "react"
import * as Icon from "react-feather"
import { Button } from "@/components/ui/button"
import { DarkModeSwitch } from "react-toggle-dark-mode"
import { ThemeContext } from "./Provider"
import { SidebarMenu } from "./Sidebar"
import { Search } from "lucide-react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import PremiumModal from "../components/PremiumModal"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import logo from "@/assets/logon.png"

interface SearchResult {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  media_type: "movie" | "tv"
  release_date?: string
  first_air_date?: string
}

export default function NavbarComponent() {
  const [open, setOpen] = React.useState(false)
  const [premiumModalOpen, setPremiumModalOpen] = React.useState(false)
  const router = useRouter()
  const theme = useContext(ThemeContext)
  const { setTheme } = useTheme()
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVip, setIsVip] = useState(false)
  const [loading, setLoading] = useState(true)
  const navb = useTranslations("NavBar")

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/user-info")
          if (!res.ok) {
            throw new Error("Failed to fetch user info")
          }
          const data = await res.json()
          setIsVip(data.isVip)
        } catch (error) {
          console.error("Error fetching user info:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserInfo()
  }, [status])

  const handleSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=3292348a48f36b094081736c090646ee&query=${encodeURIComponent(term)}&include_adult=false`,
      )
      if (!response.ok) throw new Error("Failed to fetch results")

      const data = await response.json()
      setSearchResults(data.results)
    } catch (err) {
      console.error("Search Error:", err)
      setError("An error occurred while searching. Please try again.")
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) handleSearch(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, handleSearch])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSearchTerm("")
      setSearchResults([])
      setError(null)
    }
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const onDarkModeToggle = (e: boolean) => {
    setTheme(e ? "dark" : "light")
    theme?.setTheme(e ? "dark" : "light")
  }

  if (loading) {
    return (
      <header className="sticky z-50 flex items-center justify-between w-full px-4 py-4">
        <div className="flex items-center">
          <Skeleton className="w-[40px] h-[40px]" />
          <Skeleton className="w-[120px] h-[20px] rounded-full ml-4" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="w-[100px] h-[40px]" />
          <Skeleton className="w-[40px] h-[40px] rounded-lg" />
          <Skeleton className="w-[40px] h-[40px] rounded-full" />
        </div>
      </header>
    )
  }

  if (!session) {
    return null
  }

  return (
    <>
      <PremiumModal open={premiumModalOpen} onOpenChange={setPremiumModalOpen} />

      <header className="sticky top-0 z-50 flex items-center justify-between w-full md:w-[calc(100%-12rem)] md:ml-auto text-sm py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="w-full px-4 flex items-center justify-between" aria-label="Global">
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <Link href="/home" className="flex items-center gap-2">
               <Image src={logo} alt="Criaflix" className="max-w-[120px]"/>
              </Link>
            </div>

            {/* Mobile search button */}
            <Button
              className="text-[14px] text-zinc-400 bg-secondary hover:bg-muted pr-2 hover:opacity-80 flex md:hidden"
              size="icon"
              onClick={() => setOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Search button - desktop */}
            <Button
              className="text-[14px] text-zinc-400 bg-secondary hover:bg-muted pr-2 hover:opacity-80 hidden md:flex"
              onClick={() => setOpen(true)}
            >
              <Search className="mr-2 h-4 w-4 text-xs" />
              <span className="hidden sm:inline">{navb("inputsearch")}</span>
              <span className="sm:hidden">Buscar</span>
              <p className="text-sm text-muted-foreground ml-2 hidden sm:block">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-zinc-200 dark:bg-zinc-700/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>J
                </kbd>
              </p>
            </Button>

            <CommandDialog open={open} onOpenChange={handleOpenChange}>
              <CommandInput
                placeholder="Search for a movie or TV series..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList className="max-h-[300px] overflow-y-auto">
                {isLoading && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
                {error && <div className="px-4 py-6 text-center text-sm text-red-500">{error}</div>}
                {searchResults.length === 0 && !isLoading && !error && searchTerm.length > 1 && (
                  <CommandEmpty>No results found.</CommandEmpty>
                )}
                {searchResults.length > 0 && (
                  <div>
                    {searchResults.map((item) => (
                      <Link href={`/media/${item.id}?mediaType=${item.media_type}`} key={item.id}>
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 px-4 py-2 hover:bg-secondary transition-colors cursor-pointer"
                        >
                          {item.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                              alt={item.title || item.name || "Poster"}
                              width={46}
                              height={69}
                              className="rounded object-cover"
                            />
                          ) : (
                            <div className="w-[46px] h-[69px] bg-gray-200 rounded flex items-center justify-center">
                              <Icon.Search className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">{item.title || item.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.media_type === "movie" ? "Movie" : "TV Series"} •{" "}
                              <b className="font-normal">
                                {item.release_date || item.first_air_date
                                  ? new Date(item.release_date || item.first_air_date || "").getFullYear()
                                  : "Unknown Year"}
                              </b>
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CommandList>
            </CommandDialog>
          </div>
          <div className="flex items-center ml-auto gap-2">
            {!isVip && (
              <Button
                className="bg-[#ffc34f]/20 text-[#ffc34f] hover:bg-[#ffc34f]/30 hidden sm:flex"
                onClick={() => setPremiumModalOpen(true)}
              >
                <Crown className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">{navb("btnPremium")}</span>
              </Button>
            )}

            <LanguageSwitcher />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <a className="flex items-center space-x-2 font-medium cursor-pointer" aria-current="page">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={session.user?.image || ""} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </a>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center py-2 cursor-pointer">
                    <Icon.User size={15} className="mr-2" /> {navb("profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="text-red-400 py-2">
                  <span>
                    <Icon.LogOut size={15} className="mr-2" />
                  </span>{" "}
                  {navb("btnlogout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>
    </>
  )
}
