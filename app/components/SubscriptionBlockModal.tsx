"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crown, Lock, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface SubscriptionBlockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason: "subscription_expired" | "no_subscription" | "subscription_cancelled"
  expiresAt?: Date | null
}

export default function SubscriptionBlockModal({ open, onOpenChange, reason, expiresAt }: SubscriptionBlockModalProps) {
  const router = useRouter()

  const getTitle = () => {
    switch (reason) {
      case "subscription_expired":
        return "Your Subscription Has Expired"
      case "subscription_cancelled":
        return "Subscription Cancelled"
      default:
        return "VIP Subscription Required"
    }
  }

  const getDescription = () => {
    switch (reason) {
      case "subscription_expired":
        return "Your VIP subscription expired. Renew now to continue watching premium content without interruption."
      case "subscription_cancelled":
        return `Your subscription is cancelled and will end on ${expiresAt?.toLocaleDateString()}. Renew to continue access.`
      default:
        return "This content is only available to VIP subscribers. Subscribe now to unlock unlimited streaming!"
    }
  }

  const benefits = [
    "Unlimited access to all content",
    "Ad-free viewing experience",
    "4K & Full HD quality streaming",
    "Early access to new releases",
    "Premium server access",
    "Priority customer support",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">{getTitle()}</DialogTitle>
          <DialogDescription className="text-base mt-2">{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Benefits */}
          <div className="bg-card/50 border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#ffc34f]" />
              VIP Subscription Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
              <h4 className="font-semibold text-lg">Monthly Plan</h4>
              <div className="mt-2">
                <span className="text-3xl font-bold">R$ 9,99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Perfect for getting started</p>
            </div>

            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                BEST VALUE
              </div>
              <h4 className="font-semibold text-lg">Quarterly Plan</h4>
              <div className="mt-2">
                <span className="text-3xl font-bold">R$ 24,50</span>
                <span className="text-muted-foreground">/3 months</span>
              </div>
              <p className="text-sm text-primary mt-2 font-semibold">Save R$ 5,47!</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-[#ffc34f] text-black hover:bg-[#ffc34f]/90"
              size="lg"
              onClick={() => {
                router.push("/profile")
                onOpenChange(false)
              }}
            >
              <Crown className="w-4 h-4 mr-2" />
              {reason === "subscription_expired" ? "Renew Subscription" : "Subscribe Now"}
            </Button>
            <Button variant="outline" size="lg" onClick={() => onOpenChange(false)} className="flex-1">
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
