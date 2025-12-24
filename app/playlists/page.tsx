"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, ListVideo, Lock, Globe, Trash2, Edit } from "lucide-react"
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

export default function PlaylistsPage() {
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
        title: "Error",
        description: "Failed to load playlists",
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
        title: "Error",
        description: "Title is required",
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
        title: "Success",
        description: "Playlist created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create playlist",
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
        title: "Success",
        description: "Playlist updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update playlist",
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
        title: "Success",
        description: "Playlist deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete playlist",
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

  return (
    <div className="container mx-auto p-2 sm:p-4 pb-20 md:pb-4 bg-background">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Playlists</h1>
          <p className="text-muted-foreground text-sm mt-1">Organize your favorite movies and series</p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Playlist</span>
              <span className="sm:hidden">New</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="My Awesome Playlist"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublic">Make Public</Label>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                />
              </div>
              <Button type="submit" className="w-full">
                Create Playlist
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-12">
          <ListVideo className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-4">No playlists yet</h2>
          <p className="text-muted-foreground mb-6">Create your first playlist to organize your content</p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{playlist.title}</CardTitle>
                    {playlist.description && (
                      <CardDescription className="mt-1 line-clamp-2">{playlist.description}</CardDescription>
                    )}
                  </div>
                  {playlist.isPublic ? (
                    <Globe className="h-4 w-4 text-green-500 shrink-0 ml-2" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">
                    {playlist._count.items} {playlist._count.items === 1 ? "item" : "items"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(playlist.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="default" className="flex-1" size="sm">
                    <Link href={`/playlists/${playlist.id}`}>View</Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(playlist)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeletePlaylistId(playlist.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPlaylist} onOpenChange={(open) => !open && setEditingPlaylist(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Playlist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPlaylist} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="My Awesome Playlist"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-isPublic">Make Public</Label>
              <Switch
                id="edit-isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>
            <Button type="submit" className="w-full">
              Update Playlist
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePlaylistId} onOpenChange={(open) => !open && setDeletePlaylistId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the playlist and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlaylist} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
