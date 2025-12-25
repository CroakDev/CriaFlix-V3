"use client"

import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, Home, Flame, Play, Compass, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Logo from "@/assets/logon.png"
import * as React from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"

type Menu = {
  label: string
  name: string
  icon: React.ReactNode
  submenu?: Submenu[]
  href: string
}

type Submenu = {
  name: string
  icon: React.ReactNode
  href: string
}

export function SidebarMenu() {
  const { data: session, status } = useSession() // Obtém a sessão do usuário
  const [pathname, setPathname] = useState<string | null>(null)
  const [isVip, setIsVip] = useState(false) // Estado para verificar se o usuário é VIP
  const [loading, setLoading] = useState(true) // Estado de carregamento
  const side = useTranslations("Sidebar")

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
          setLoading(false) // Desativa o carregamento
        }
      }
    }

    fetchUserInfo()
  }, [status])

  // Usa useEffect para garantir que rodará no cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname) // Obtém a URL atual
    }
  }, [])

  const menus: Menu[] = [
    {
      label: side("tag1"),
      name: side("option1"),
      icon: <Home size={15} className="mr-2" />,
      href: "/home",
    },
    {
      label: side("tag1"),
      name: side("option2"),
      icon: <Compass size={15} className="mr-2" />,
      href: "/browse",
    },
    {
      label: side("tag2"),
      name: "Favorites",
      icon: <Heart size={15} className="mr-2" />,
      href: "/favorites",
    },
    {
      label: side("tag2"),
      name: side("option4"),
      icon: <Play size={15} className="mr-2" />,
      href: "/playlists",
    },
    {
      label: side("tag2"),
      name: side("option5"),
      icon: <Flame size={15} className="mr-2" />,
      href: "/home/releases",
    },
  ]

  const uniqueLabels = Array.from(new Set(menus.map((menu) => menu.label)))

  return (
    <div className="hidden md:block fixed left-0 top-0 h-screen w-48 bg-background z-50 border-r-[1px] border-gray-500/10 flex flex-col justify-between">
      <ScrollArea className="h-full">
        <Link href="/">
          <div className="flex justify-center items-center py-6 mt-5">
            <Image style={{maxWidth: '160px'}} src={Logo || "/placeholder.svg"} alt="Logo" />
         
          </div>
        </Link>
        <div className="md:px-4 sm:p-0 mt-5">
          {uniqueLabels.map((label, index) => (
            <React.Fragment key={label}>
              {label && (
                <p
                  className={`mx-4 mb-3 text-xs text-left tracking-wider font-bold text-slate-300 ${index > 0 ? "mt-10" : ""}`}
                >
                  {label}
                </p>
              )}
              {menus
                .filter((menu) => menu.label === label)
                .map((menu) => {
                  const isActive = pathname?.startsWith(menu.href) // Verifica se a rota atual está na mesma hierarquia que o menu
                  return (
                    <React.Fragment key={menu.name}>
                      {menu.submenu && menu.submenu.length > 0 ? (
                        <Accordion
                          key={menu.name}
                          type="single"
                          className="mt-[-10px] mb-[-10px] p-0 font-light text-dark dark:text-white dark:text-opacity-[0.6]"
                          collapsible
                        >
                          <AccordionItem value={menu.name} className="m-0 p-0 font-normal">
                            <AccordionTrigger>
                              <a
                                className={cn(
                                  "w-full flex justify-start text-xs font-normal h-10 bg-background my-2 items-center p-4 rounded-md",
                                  isActive
                                    ? "bg-primary text-white"
                                    : "bg-white text-dark dark:text-white dark:text-opacity-[0.6] dark:bg-background hover:bg-secondary dark:hover:bg-secondary",
                                )}
                              >
                                <div className="flex items-center w-full">
                                  <div className="w-6">{menu.icon}</div>
                                  {menu.name}
                                </div>
                                <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                              </a>
                            </AccordionTrigger>
                            <AccordionContent>
                              {menu.submenu.map((submenu) => {
                                const isSubmenuActive = pathname === submenu.href
                                return (
                                  <Link
                                    key={submenu.name}
                                    href={submenu.href}
                                    className={cn(
                                      "text-muted-foreground mt-0 mb-0 flex text-xs h-10 items-center p-4 rounded-md my-2",
                                      isSubmenuActive
                                        ? "bg-secondary dark:text-white dark:text-opacity-[0.6]"
                                        : "text-dark dark:text-white dark:text-opacity-[0.6] hover:bg-secondary dark:hover:bg-secondary",
                                    )}
                                  >
                                    <div className="w-6">{submenu.icon}</div>
                                    {submenu.name}
                                  </Link>
                                )
                              })}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <Link
                          href={menu.href}
                          className={cn(
                            "flex text-xs h-10 items-center p-4 rounded-md my-2",
                            isActive
                              ? "bg-secondary dark:text-white dark:text-opacity-[0.6]"
                              : "text-dark dark:text-white dark:text-opacity-[0.6] hover:bg-secondary dark:hover:bg-secondary",
                          )}
                        >
                          <div className="w-6">{menu.icon}</div>
                          {menu.name}
                        </Link>
                      )}
                    </React.Fragment>
                  )
                })}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
      {!isVip ? (
        // Condição para exibir o botão de upgrade apenas se o usuário não for VIP
        <div className="p-4 bg-secondary m-4 rounded-lg text-center">
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{side("upgrade")}</p>
          <button className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-md hover:opacity-90 transition-all ease-linear">
            {side("buttonupgrade")}
          </button>
        </div>
      ) : (
        // Condição para exibir conteúdo especial se o usuário for VIP
        <div className="p-4 bg-secondary m-4 rounded-lg text-center">
          <p className="text-xs text-slate-600 dark:text-slate-300 ">
            You are a VIP member! Enjoy your exclusive perks!
          </p>
        </div>
      )}
    </div>
  )
}
