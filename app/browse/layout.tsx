"use client"

import type React from "react"
import NavbarComponent from "../components/Navbar"
import { SidebarMenu } from "../components/Sidebar"
import MobileBottomNav from "../components/MobileBottomNav"
import SubscriptionWarningBanner from "../components/SubscriptionWarningBanner"
import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

function RootLayout({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  return (
    <div className="flex flex-col h-screen">
      <SessionProvider session={session ?? undefined}>
        <NavbarComponent />
        <SubscriptionWarningBanner />
        <div className="flex flex-1 overflow-hidden">
          <SidebarMenu />
          <main className="flex-1 w-full md:ml-48 p-4 pb-20 md:pb-4 overflow-auto">{children}</main>
        </div>
        <MobileBottomNav />
      </SessionProvider>
    </div>
  )
}

export default RootLayout
