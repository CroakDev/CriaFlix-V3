"use client"

import { Home, Compass, Heart, ListVideo, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export default function MobileBottomNav() {
  const [pathname, setPathname] = useState<string>("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname)
    }
  }, [])

  const navItems = [
    {
      name: "Início",
      icon: Home,
      href: "/home",
      active: pathname === "/home" || pathname.startsWith("/home"),
    },
    {
      name: "Navegar",
      icon: Compass,
      href: "/browse",
      active: pathname === "/browse",
    },
    {
      name: "Favoritos",
      icon: Heart,
      href: "/favorites",
      active: pathname === "/favorites",
    },
    {
      name: "Playlists",
      icon: ListVideo,
      href: "/playlists",
      active: pathname === "/playlists" || pathname.startsWith("/playlists"),
    },
    {
      name: "Perfil",
      icon: User,
      href: "/profile",
      active: pathname === "/profile",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
