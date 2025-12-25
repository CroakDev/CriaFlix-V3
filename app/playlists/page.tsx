"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, ListVideo, Lock, Globe, Trash2, Edit, Play, MoreVertical } from "lucide-react"
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

interface Playlist {
  id: number
  title: string
  description: string | null
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
    isPublic: false,
  })
  const { toast } = useToast()
  const { data: session } = useSession()

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
      setFormData({ title: "", description: "", isPublic: false })

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
      setFormData({ title: "", description: "", isPublic: false })

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
          <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <ListVideo className="h-16 w-16 text-primary/40" />
            <div className="absolute top-2 right-2">
              {playlist.isPublic ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Globe className="h-3 w-3 mr-1" />
                  Pública
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
                  <Lock className="h-3 w-3 mr-1" />
                  Privada
                </Badge>
              )}
            </div>

            {/* Dropdown Menu */}
            <div className="absolute top-2 left-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/20 hover:bg-black/40">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => openEditDialog(playlist)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeletePlaylistId(playlist.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
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
                  {playlist._count.items} {playlist._count.items === 1 ? "item" : "itens"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(playlist.updatedAt).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <Link href={`/playlists/${playlist.id}`}>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Ver Playlist
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Minhas Playlists
          </h1>
          <p className="text-muted-foreground mt-2">Organize seus filmes e séries favoritos</p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Nova Playlist</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Playlist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Minha Playlist Incrível"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional..."
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Tornar Pública
                </Label>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                />
              </div>
              <Button type="submit" className="w-full">
                Criar Playlist
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <ListVideo className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Nenhuma playlist ainda</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Crie sua primeira playlist para organizar seu conteúdo favorito
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Criar Playlist
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPlaylist} onOpenChange={(open) => !open && setEditingPlaylist(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Playlist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPlaylist} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Minha Playlist Incrível"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição opcional..."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="edit-isPublic" className="cursor-pointer">
                Tornar Pública
              </Label>
              <Switch
                id="edit-isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>
            <Button type="submit" className="w-full">
              Atualizar Playlist
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePlaylistId} onOpenChange={(open) => !open && setDeletePlaylistId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a playlist e todos os seus itens.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlaylist} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}