"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Plus, Loader2, Check, ListVideo, Globe, Lock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

interface Playlist {
  id: number
  title: string
  description: string | null
  isPublic: boolean
  _count: {
    items: number
  }
}

interface AddToPlaylistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mediaId: number
  mediaType: "movie" | "tv"
  mediaTitle: string
  posterPath: string | null
}

export default function AddToPlaylistDialog({
  open,
  onOpenChange,
  mediaId,
  mediaType,
  mediaTitle,
  posterPath,
}: AddToPlaylistDialogProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    if (open && session) {
      fetchPlaylists()
      checkExistingPlaylists()
    }
  }, [open, session])

  const fetchPlaylists = async () => {
    try {
      const response = await fetch("/api/playlists")
      if (response.ok) {
        const data = await response.json()
        setPlaylists(data)
      }
    } catch (error) {
      console.error("Error fetching playlists:", error)
    }
  }

  const checkExistingPlaylists = async () => {
    try {
      const response = await fetch("/api/playlists")
      if (response.ok) {
        const data = await response.json()
        const playlistsWithItem = new Set<number>()

        for (const playlist of data) {
          const itemResponse = await fetch(`/api/playlists/${playlist.id}`)
          if (itemResponse.ok) {
            const playlistData = await itemResponse.json()
            const hasItem = playlistData.items.some(
              (item: any) => item.mediaId === mediaId && item.mediaType === mediaType
            )
            if (hasItem) {
              playlistsWithItem.add(playlist.id)
            }
          }
        }
        setSelectedPlaylists(playlistsWithItem)
      }
    } catch (error) {
      console.error("Error checking playlists:", error)
    }
  }

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a playlist",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPlaylistName,
          description: "",
          isPublic: false,
        }),
      })

      if (response.ok) {
        const newPlaylist = await response.json()
        await addToPlaylist(newPlaylist.id)
        setNewPlaylistName("")
        await fetchPlaylists()
        toast({
          title: "Sucesso",
          description: "Playlist criada e item adicionado!",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar playlist",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const addToPlaylist = async (playlistId: number) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId,
          mediaType,
          mediaTitle,
          posterPath,
        }),
      })

      if (response.ok) {
        return true
      }
      return false
    } catch (error) {
      console.error("Error adding to playlist:", error)
      return false
    }
  }

  const removeFromPlaylist = async (playlistId: number) => {
    try {
      const playlistResponse = await fetch(`/api/playlists/${playlistId}`)
      if (playlistResponse.ok) {
        const playlistData = await playlistResponse.json()
        const item = playlistData.items.find(
          (i: any) => i.mediaId === mediaId && i.mediaType === mediaType
        )

        if (item) {
          const response = await fetch(`/api/playlists/${playlistId}/items?itemId=${item.id}`, {
            method: "DELETE",
          })
          return response.ok
        }
      }
      return false
    } catch (error) {
      console.error("Error removing from playlist:", error)
      return false
    }
  }

  const handleTogglePlaylist = async (playlistId: number) => {
    const isSelected = selectedPlaylists.has(playlistId)
    const newSelected = new Set(selectedPlaylists)

    if (isSelected) {
      const success = await removeFromPlaylist(playlistId)
      if (success) {
        newSelected.delete(playlistId)
        setSelectedPlaylists(newSelected)
        toast({
          title: "Removido",
          description: "Item removido da playlist",
        })
      }
    } else {
      const success = await addToPlaylist(playlistId)
      if (success) {
        newSelected.add(playlistId)
        setSelectedPlaylists(newSelected)
        toast({
          title: "Adicionado",
          description: "Item adicionado à playlist",
        })
      }
    }
  }

  const handleSaveAndClose = () => {
    onOpenChange(false)
  }

  if (!session) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Necessário</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Faça login para adicionar itens às suas playlists</p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar à Playlist</DialogTitle>
          <p className="text-sm text-muted-foreground">{mediaTitle}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Playlist */}
          <div className="space-y-2">
            <Label htmlFor="new-playlist" className="text-sm font-semibold">
              Criar Nova Playlist
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-playlist"
                placeholder="Nome da playlist..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreatePlaylist()
                  }
                }}
              />
              <Button onClick={handleCreatePlaylist} disabled={isCreating} size="icon">
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Existing Playlists */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Minhas Playlists</Label>
            {playlists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ListVideo className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Você ainda não tem playlists</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-4 space-y-2">
                  {playlists.map((playlist) => {
                    const isSelected = selectedPlaylists.has(playlist.id)
                    return (
                      <div
                        key={playlist.id}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleTogglePlaylist(playlist.id)}
                      >
                        <Checkbox checked={isSelected} className="mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{playlist.title}</p>
                            {playlist.isPublic ? (
                              <Globe className="h-3 w-3 text-green-500 shrink-0" />
                            ) : (
                              <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                          </div>
                          {playlist.description && (
                            <p className="text-xs text-muted-foreground truncate">{playlist.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {playlist._count.items} {playlist._count.items === 1 ? "item" : "itens"}
                          </p>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0 mt-1" />}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          <Button onClick={handleSaveAndClose} className="w-full">
            Concluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
