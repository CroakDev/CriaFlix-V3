"use client"

import type React from "react"

import NavbarComponent from "../../components/Navbar"
import { SidebarMenu } from "../../components/Sidebar"
import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth" // Importando o tipo Session do next-auth

function RootLayout({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  return (
    <div className="flex flex-col h-screen">
      <SessionProvider session={session ?? undefined}>
        <NavbarComponent />
        <div className="flex flex-1 overflow-hidden">
          <SidebarMenu />
          <main className="flex-1 ml-48 p-4 pt-16 overflow-auto">{children}</main>
        </div>
      </SessionProvider>
    </div>
  )
}

export default RootLayout
