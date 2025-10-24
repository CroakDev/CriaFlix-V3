"use client"

import { useEffect, useState, Suspense } from "react"
import { NextIntlClientProvider } from "next-intl"
import { AbstractIntlMessages } from "next-intl"
import { SessionProvider } from "next-auth/react"
import { Session } from "next-auth"
import Providers from "./components/Provider"

interface AppProvidersProps {
  children: React.ReactNode
  session?: Session | null
}

export default function AppProviders({ children, session }: AppProvidersProps) {
  const [currentLocale, setCurrentLocale] = useState<string>("pt")
  const [messages, setMessages] = useState<AbstractIntlMessages | null>(null)

  useEffect(() => {
    const storedLocale = localStorage.getItem("locale")
    const browserLocale = navigator.language.split("-")[0]
    const validLocale = ["en", "pt"].includes(browserLocale) ? browserLocale : "pt"
    const locale = storedLocale || validLocale
    setCurrentLocale(locale)
    localStorage.setItem("locale", locale)
  }, [])

  useEffect(() => {
    if (currentLocale) {
      import(`../messages/${currentLocale}.json`).then((mod) => setMessages(mod.default))
    }
  }, [currentLocale])

  if (!messages) return null

  return (
    <SessionProvider session={session ?? undefined}>
      <Suspense>
        <NextIntlClientProvider locale={currentLocale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </Suspense>
    </SessionProvider>
  )
}
