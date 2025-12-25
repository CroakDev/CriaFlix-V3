"use client"

import { Home, Compass, Heart, ListVideo, Flame } from "lucide-react"
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
      name: "Lançamentos",
      icon: Flame,
      href: "/home/releases",
      active: pathname === "/home/releases",
    },
  ]

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 rounded-xl",
                  item.active
                    ? "text-primary scale-110"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <Icon className={cn("h-5 w-5 transition-all", item.active && "stroke-[2.5]")} />
                <span className={cn("text-[10px] font-medium", item.active && "font-semibold")}>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
