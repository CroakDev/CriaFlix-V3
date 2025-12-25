"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SubscriptionWarningBanner() {
  const [show, setShow] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [subscriptionStatus, setSubscriptionStatus] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await fetch("/api/subscription")
        const data = await res.json()

        if (data.subscriptionStatus === "active" && data.subscriptionEndDate) {
          const endDate = new Date(data.subscriptionEndDate)
          const now = new Date()
          const diff = endDate.getTime() - now.getTime()
          const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

          setDaysRemaining(days)
          setSubscriptionStatus(data.subscriptionStatus)

          // Show warning if 7 days or less remaining
          if (days <= 7 && days > 0) {
            const dismissed = localStorage.getItem("subscription-warning-dismissed")
            const dismissedDate = dismissed ? new Date(dismissed) : null

            // Show again if dismissed more than 24 hours ago
            if (!dismissedDate || Date.now() - dismissedDate.getTime() > 24 * 60 * 60 * 1000) {
              setShow(true)
            }
          }
        } else if (data.subscriptionStatus === "expired") {
          setSubscriptionStatus("expired")
          setShow(true)
        }
      } catch (error) {
        console.error("Error checking subscription:", error)
      }
    }

    checkSubscription()
  }, [])

  const handleDismiss = () => {
    localStorage.setItem("subscription-warning-dismissed", new Date().toISOString())
    setShow(false)
  }

  const handleRenew = () => {
    router.push("/profile?tab=subscription")
  }

  if (!show) return null

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-40 ${
        subscriptionStatus === "expired"
          ? "bg-red-500/10 border-b border-red-500/30"
          : "bg-yellow-500/10 border-b border-yellow-500/30"
      } backdrop-blur-sm`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle
              className={`w-5 h-5 flex-shrink-0 ${subscriptionStatus === "expired" ? "text-red-500" : "text-yellow-500"}`}
            />
            <div className="flex-1">
              <p
                className={`text-sm font-semibold ${subscriptionStatus === "expired" ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"}`}
              >
                {subscriptionStatus === "expired"
                  ? "Your VIP subscription has expired!"
                  : `Your VIP subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}!`}
              </p>
              <p className="text-xs text-muted-foreground">
                {subscriptionStatus === "expired"
                  ? "Renew now to regain access to premium content."
                  : "Renew now to continue enjoying premium features without interruption."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleRenew}
              className="bg-[#ffc34f] text-black hover:bg-[#ffc34f]/90 flex-shrink-0"
            >
              <Crown className="w-3 h-3 mr-1" />
              Renew Now
            </Button>
            {subscriptionStatus !== "expired" && (
              <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8 flex-shrink-0">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
