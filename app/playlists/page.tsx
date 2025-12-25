"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, ListVideo, Lock, Globe, Trash2, Edit, Play, MoreVertical, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import Image from "next/image"

interface Playlist {
  id: number
  title: string
  description: string | null
  coverImage: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
  _count: {
    items: number
  }
}

export default function ImprovedPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null)
  const [deletePlaylistId, setDeletePlaylistId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverImage: "",
    isPublic: false,
  })
  const { toast } = useToast()
  const { data: session } = useSession()
  const t = useTranslations("Playlists")

  useEffect(() => {
    if (session) {
      fetchPlaylists()
    }
  }, [session])

  const fetchPlaylists = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/playlists")
      if (!response.ok) throw new Error("Failed to fetch playlists")

      const data = await response.json()
      setPlaylists(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar playlists",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to create playlist")

      await fetchPlaylists()
      setCreateDialogOpen(false)
      setFormData({ title: "", description: "", coverImage: "", isPublic: false })

      toast({
        title: "Sucesso",
        description: "Playlist criada com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar playlist",
        variant: "destructive",
      })
    }
  }

  const handleEditPlaylist = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingPlaylist) return

    try {
      const response = await fetch(`/api/playlists/${editingPlaylist.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to update playlist")

      await fetchPlaylists()
      setEditingPlaylist(null)
      setFormData({ title: "", description: "", coverImage: "", isPublic: false })

      toast({
        title: "Sucesso",
        description: "Playlist atualizada com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar playlist",
        variant: "destructive",
      })
    }
  }

  const handleDeletePlaylist = async () => {
    if (!deletePlaylistId) return

    try {
      const response = await fetch(`/api/playlists/${deletePlaylistId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete playlist")

      await fetchPlaylists()
      setDeletePlaylistId(null)

      toast({
        title: "Sucesso",
        description: "Playlist excluída com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir playlist",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (playlist: Playlist) => {
    setEditingPlaylist(playlist)
    setFormData({
      title: playlist.title,
      description: playlist.description || "",
      coverImage: playlist.coverImage || "",
      isPublic: playlist.isPublic,
    })
  }

  const PlaylistCard = ({ playlist }: { playlist: Playlist }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-primary/10 hover:border-primary/30">
          <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
            {playlist.coverImage ? (
              <Image
                src={playlist.coverImage || "/placeholder.svg"}
                alt={playlist.title}
                fill
                className="object-cover"
              />
            ) : (
              <ListVideo className="h-16 w-16 text-primary/40" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute top-2 right-2 z-10">
              {playlist.isPublic ? (
                <Badge className="bg-green-500/90 text-white border-green-500/30 backdrop-blur-sm">
                  <Globe className="h-3 w-3 mr-1" />
                  {t("public")}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-500/90 text-white backdrop-blur-sm">
                  <Lock className="h-3 w-3 mr-1" />
                  {t("private")}
                </Badge>
              )}
            </div>

            <div className="absolute top-2 left-2 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => openEditDialog(playlist)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t("edit")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeletePlaylistId(playlist.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {playlist.title}
                </h3>
                {playlist.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{playlist.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {playlist._count.items} {playlist._count.items === 1 ? t("item") : t("items")}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(playlist.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <Link href={`/playlists/${playlist.id}`}>
                <Button
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {t("view")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 pb-20 md:pb-4 bg-background min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">{t("create")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("createNew")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("titleLabel")} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("titleLabel")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("descriptionLabel")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("descriptionPlaceholder")}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Cover Image URL
                </Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
                <p className="text-xs text-muted-foreground">Paste an image URL from TMDB or any public image</p>
              </div>
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="isPublic" className="cursor-pointer">
                  {t("makePublic")}
                </Label>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                />
              </div>
              <Button type="submit" className="w-full">
                {t("createButton")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <ListVideo className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t("empty")}</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t("emptyDescription")}</p>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            {t("create")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}

      <Dialog open={!!editingPlaylist} onOpenChange={(open) => !open && setEditingPlaylist(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("edit")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPlaylist} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">{t("titleLabel")} *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t("titleLabel")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">{t("descriptionLabel")}</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t("descriptionPlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-coverImage" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Cover Image URL
              </Label>
              <Input
                id="edit-coverImage"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
              {formData.coverImage && (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                  <Image src={formData.coverImage || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="edit-isPublic" className="cursor-pointer">
                {t("makePublic")}
              </Label>
              <Switch
                id="edit-isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>
            <Button type="submit" className="w-full">
              {t("updateButton")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletePlaylistId} onOpenChange={(open) => !open && setDeletePlaylistId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlaylist} className="bg-destructive text-destructive-foreground">
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
