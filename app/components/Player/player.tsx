"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Server, CheckCircle, XCircle, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import Image from "next/image"

interface ServerInfo {
  id: string
  name: string
  url: string
  country: string
  premium: boolean
}

interface ServerSelectionProps {
  servers: ServerInfo[]
  backgroundImage: string
  episodeKey?: string
  onEnded?: () => void
}

const getFlagUrl = (countryCode: string) => {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
}

export default function FullyResponsiveServerSelection({
  servers,
  backgroundImage,
  episodeKey,
  onEnded,
}: ServerSelectionProps) {
  const { data: session, status } = useSession() // Obtém a sessão do usuário
  const [selectedServer, setSelectedServer] = useState<ServerInfo | null>(null)
  const [showServerSelection, setShowServerSelection] = useState(true)
  const [serverStatus, setServerStatus] = useState<Record<string, boolean>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // Estado para mensagem de erro
  const [isVip, setIsVip] = useState(false)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    const checkServerStatus = async () => {
      const status: Record<string, boolean> = {}
      for (const server of servers) {
        try {
          const response = await fetch(server.url, { method: "HEAD", mode: "no-cors" })
          status[server.id] = response.type === "opaque" ? true : response.ok
        } catch (error) {
          status[server.id] = false
        }
      }
      setServerStatus(status)
    }

    checkServerStatus()
    const interval = setInterval(checkServerStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [servers])

  useEffect(() => {
    if (episodeKey) {
      setShowServerSelection(true)
      setSelectedServer(null)
    }
  }, [episodeKey])

  const handleServerSelection = (server: ServerInfo) => {
    if (server.premium && !isVip) {
      setErrorMessage("This server is premium and you need to be a VIP member to access it.")
      return // Não permite a seleção do servidor
    }
    setSelectedServer(server)
    setShowServerSelection(false)
    setErrorMessage(null) // Limpa a mensagem de erro ao selecionar um servidor
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <AnimatePresence>
        {showServerSelection ? (
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative w-full max-w-4xl mx-auto my-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center">
                Choose your server
              </h2>
              {errorMessage && <div className="mb-4 p-2 text-red-500 bg-red-200/25 rounded">{errorMessage}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {servers.map((server) => (
                  <motion.div
                    key={server.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className="bg-dark-linear dark:bg-light-linear backdrop-blur-sm hover:bg-secondary transition-all duration-300 ease-in-out border-none shadow-lg w-72 h-40"
                      style={{ border: "1px solid #3A3A42" }}
                    >
                      <CardContent className="p-4">
                        <button
                          onClick={() => handleServerSelection(server)}
                          className="w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-lg"
                        >
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="relative">
                              <Server className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 rounded-full p-0.5 sm:p-1 overflow-hidden">
                                <Image
                                  src={getFlagUrl(server.country) || "/placeholder.svg"}
                                  width={50}
                                  height={100}
                                  alt={`Bandeira de ${server.country}`}
                                  className="w-4 h-4 sm:w-5 sm:h-5 object-cover rounded-full"
                                />
                              </div>
                            </div>
                            <span className="flex items-center text-sm sm:text-base md:text-lg font-medium text-center">
                              {server.name}
                              {server.premium && <Crown className="w-5 h-5 text-yellow-300 ml-2" />}
                            </span>

                            {serverStatus[server.id] !== undefined && (
                              <div className="flex items-center space-x-1">
                                {serverStatus[server.id] ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-xs sm:text-sm text-green-400">Online</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 text-red-400" />
                                    <span className="text-xs sm:text-sm text-red-400">Offline</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="relative w-full h-full "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <iframe
              key={`${selectedServer?.id}-${episodeKey || "default"}`}
              src={selectedServer?.url}
              className="w-full h-full border-0"
              allowFullScreen
              onEnded={onEnded}
            />
            <motion.div
              className="absolute top-4 left-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowServerSelection(true)}
                className="bg-black/50 hover:bg-black/70 text-white rounded-full"
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
