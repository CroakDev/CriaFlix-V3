"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  User,
  Settings,
  Bell,
  Shield,
  Crown,
  Mail,
  Calendar,
  Edit2,
  Save,
  X,
  Film,
  Heart,
  Clock,
  Star,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isVip, setIsVip] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const [subscription, setSubscription] = useState<{
    subscriptionPlan: string | null
    subscriptionStatus: string
    subscriptionStartDate: Date | null
    subscriptionEndDate: Date | null
    subscriptionRenewable: boolean
  }>({
    subscriptionPlan: null,
    subscriptionStatus: "inactive",
    subscriptionStartDate: null,
    subscriptionEndDate: null,
    subscriptionRenewable: true,
  })

  // User preferences state
  const [preferences, setPreferences] = useState({
    displayName: "",
    bio: "",
    emailNotifications: true,
    pushNotifications: false,
    autoplay: true,
    adultContent: false,
    language: "pt-BR",
    quality: "auto",
  })

  // User stats (mock data - replace with real API)
  const [stats, setStats] = useState({
    moviesWatched: 0,
    seriesWatched: 0,
    favorites: 0,
    watchlist: 0,
    totalHours: 0,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/user-info")
          if (res.ok) {
            const data = await fetch("/api/subscription")
            const subscriptionData = await data.json()

            setIsVip(subscriptionData.isVip)
            setSubscription({
              subscriptionPlan: subscriptionData.subscriptionPlan,
              subscriptionStatus: subscriptionData.subscriptionStatus,
              subscriptionStartDate: subscriptionData.subscriptionStartDate
                ? new Date(subscriptionData.subscriptionStartDate)
                : null,
              subscriptionEndDate: subscriptionData.subscriptionEndDate
                ? new Date(subscriptionData.subscriptionEndDate)
                : null,
              subscriptionRenewable: subscriptionData.subscriptionRenewable,
            })

            // Load user preferences from localStorage or API
            const savedPrefs = localStorage.getItem("userPreferences")
            if (savedPrefs) {
              setPreferences(JSON.parse(savedPrefs))
            } else {
              setPreferences((prev) => ({
                ...prev,
                displayName: session?.user?.name || "",
              }))
            }

            // Load stats from localStorage (mock)
            const savedStats = localStorage.getItem("userStats")
            if (savedStats) {
              setStats(JSON.parse(savedStats))
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserData()
  }, [status, session])

  const handleSaveProfile = () => {
    // Save to localStorage (replace with API call)
    localStorage.setItem("userPreferences", JSON.stringify(preferences))
    toast.success("Profile updated successfully!")
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    // Reload preferences
    const savedPrefs = localStorage.getItem("userPreferences")
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs))
    }
    setIsEditing(false)
  }

  const handleRenewSubscription = async () => {
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: subscription.subscriptionPlan || "monthly",
          action: "renew",
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success("Subscription renewed successfully!")
        // Reload subscription data
        window.location.reload()
      } else {
        toast.error("Failed to renew subscription")
      }
    } catch (error) {
      console.error("Error renewing subscription:", error)
      toast.error("An error occurred")
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll still have access until the end date.")) {
      return
    }

    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      })

      if (res.ok) {
        toast.success("Subscription cancelled. You can still use premium features until the end date.")
        window.location.reload()
      } else {
        toast.error("Failed to cancel subscription")
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      toast.error("An error occurred")
    }
  }

  const getDaysRemaining = () => {
    if (!subscription.subscriptionEndDate) return 0
    const now = new Date()
    const diff = subscription.subscriptionEndDate.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getSubscriptionStatusBadge = () => {
    const daysRemaining = getDaysRemaining()

    switch (subscription.subscriptionStatus) {
      case "active":
        if (daysRemaining <= 7) {
          return (
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Expiring Soon
            </Badge>
          )
        }
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-500">
            Inactive
          </Badge>
        )
    }
  }

  const getPlanName = () => {
    switch (subscription.subscriptionPlan) {
      case "monthly":
        return "Monthly Plan"
      case "quarterly":
        return "Quarterly Plan"
      case "yearly":
        return "Yearly Plan"
      default:
        return "No Plan"
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      {/* Profile Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={session.user?.image || ""} />
                <AvatarFallback className="text-4xl bg-primary/10">
                  {session.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {isVip && (
                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#ffc34f] text-black hover:bg-[#ffc34f]/90">
                  <Crown className="w-3 h-3 mr-1" />
                  VIP
                </Badge>
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-bold">{preferences.displayName || session.user?.name}</h1>
                {!isEditing && (
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{session.user?.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Member since {new Date().getFullYear()}</span>
              </div>
              {preferences.bio && <p className="text-sm text-muted-foreground mt-2">{preferences.bio}</p>}
            </div>

            {!isVip && (
              <Button className="bg-[#ffc34f] text-black hover:bg-[#ffc34f]/90">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to VIP
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.moviesWatched}</p>
              <p className="text-xs text-muted-foreground">Movies Watched</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.seriesWatched}</p>
              <p className="text-xs text-muted-foreground">Series Watched</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.favorites}</p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.watchlist}</p>
              <p className="text-xs text-muted-foreground">Watchlist</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalHours}h</p>
              <p className="text-xs text-muted-foreground">Total Hours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-[800px]">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details and bio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={preferences.displayName}
                  onChange={(e) => setPreferences({ ...preferences, displayName: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={preferences.bio}
                  onChange={(e) => setPreferences({ ...preferences, bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={session.user?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} className="gap-2 bg-transparent">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#ffc34f]" />
                Subscription Management
              </CardTitle>
              <CardDescription>Manage your VIP subscription and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Subscription Status */}
              <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Current Plan</h3>
                    <p className="text-muted-foreground text-sm">{getPlanName()}</p>
                  </div>
                  {getSubscriptionStatusBadge()}
                </div>

                <Separator />

                {isVip && subscription.subscriptionStatus === "active" ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Start Date:</span>
                      <span className="text-sm font-medium">
                        {subscription.subscriptionStartDate?.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">End Date:</span>
                      <span className="text-sm font-medium">
                        {subscription.subscriptionEndDate?.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Days Remaining:</span>
                      <span className="text-sm font-bold text-primary">{getDaysRemaining()} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Auto-Renewal:</span>
                      <span className="text-sm font-medium">
                        {subscription.subscriptionRenewable ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    {getDaysRemaining() <= 7 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                            Your subscription is expiring soon!
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Renew now to continue enjoying premium features without interruption.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : subscription.subscriptionStatus === "expired" ? (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                          Your subscription has expired
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Renew your subscription to regain access to premium content and features.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : subscription.subscriptionStatus === "cancelled" ? (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                          Subscription Cancelled
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You can still use premium features until{" "}
                          {subscription.subscriptionEndDate?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">You don't have an active subscription</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {isVip &&
                  (subscription.subscriptionStatus === "active" || subscription.subscriptionStatus === "cancelled") && (
                    <Button onClick={handleRenewSubscription} className="flex-1 gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Renew Subscription
                    </Button>
                  )}

                {!isVip || subscription.subscriptionStatus === "expired" ? (
                  <Button className="flex-1 bg-[#ffc34f] text-black hover:bg-[#ffc34f]/90 gap-2">
                    <Crown className="h-4 w-4" />
                    Subscribe Now
                  </Button>
                ) : null}

                {isVip && subscription.subscriptionStatus === "active" && subscription.subscriptionRenewable && (
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    className="flex-1 text-destructive hover:text-destructive bg-transparent gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel Subscription
                  </Button>
                )}
              </div>

              {/* Subscription Benefits */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Crown className="h-4 w-4 text-[#ffc34f]" />
                  VIP Benefits
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Ad-free viewing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>4K & Full HD quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Early access to releases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Priority support 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Offline downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Premium servers access</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Playback Preferences</CardTitle>
              <CardDescription>Customize your viewing experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autoplay Next Episode</Label>
                  <p className="text-sm text-muted-foreground">Automatically play the next episode</p>
                </div>
                <Switch
                  checked={preferences.autoplay}
                  onCheckedChange={(checked) => {
                    setPreferences({ ...preferences, autoplay: checked })
                    localStorage.setItem("userPreferences", JSON.stringify({ ...preferences, autoplay: checked }))
                    toast.success("Preference updated")
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="quality">Default Video Quality</Label>
                <select
                  id="quality"
                  value={preferences.quality}
                  onChange={(e) => {
                    setPreferences({ ...preferences, quality: e.target.value })
                    localStorage.setItem("userPreferences", JSON.stringify({ ...preferences, quality: e.target.value }))
                    toast.success("Quality preference updated")
                  }}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  <option value="auto">Auto</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={preferences.language}
                  onChange={(e) => {
                    setPreferences({ ...preferences, language: e.target.value })
                    localStorage.setItem(
                      "userPreferences",
                      JSON.stringify({ ...preferences, language: e.target.value }),
                    )
                    toast.success("Language updated")
                  }}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => {
                    setPreferences({ ...preferences, emailNotifications: checked })
                    localStorage.setItem(
                      "userPreferences",
                      JSON.stringify({ ...preferences, emailNotifications: checked }),
                    )
                    toast.success("Email notifications " + (checked ? "enabled" : "disabled"))
                  }}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => {
                    setPreferences({ ...preferences, pushNotifications: checked })
                    localStorage.setItem(
                      "userPreferences",
                      JSON.stringify({ ...preferences, pushNotifications: checked }),
                    )
                    toast.success("Push notifications " + (checked ? "enabled" : "disabled"))
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Control your privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Adult Content</Label>
                  <p className="text-sm text-muted-foreground">Display mature content in search results</p>
                </div>
                <Switch
                  checked={preferences.adultContent}
                  onCheckedChange={(checked) => {
                    setPreferences({ ...preferences, adultContent: checked })
                    localStorage.setItem("userPreferences", JSON.stringify({ ...preferences, adultContent: checked }))
                    toast.success("Adult content " + (checked ? "enabled" : "disabled"))
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Account Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Download My Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
