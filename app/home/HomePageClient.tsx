"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useContext } from "react"
import { ThemeContext } from "../components/Provider"
import MediaList2 from "../components/Lists/MediaList"
import FeaturedBanner from "../components/HomePage/FeaturedBanner"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"

function HomePageClient() {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()
  const theme = useContext(ThemeContext)
  const t = useTranslations("HomePage")

  useEffect(() => {
    const checkUserSetup = async () => {
      if (status === "loading") return // Aguarda o carregamento da sessão

      if (status === "authenticated") {
        if (!session?.user?.email) {
          console.error("No user email available")
          return
        }

        try {
          const response = await fetch("/api/check-setup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: session.user.email }),
          })

          const result = await response.json()

          if (response.ok && !result.isSetupComplete) {
            router.push("/setup")
          }
        } catch (error) {
          console.error("Error checking user setup:", error)
        }
      } else {
        router.push("/") // Redireciona para a página de login se o usuário não estiver autenticado
      }
    }

    checkUserSetup()
  }, [session, status, router])

  return (
    <>
      <FeaturedBanner />
      <div>
        <MediaList2 />
      </div>
    </>
  )
}

export default HomePageClient
