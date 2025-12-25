"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ListPlus } from "lucide-react"
import AddToPlaylistDialog from "./AddToPlaylistDialog"

interface PlaylistDropdownProps {
  mediaId: number
  mediaType: "movie" | "tv"
  mediaTitle: string
  posterPath: string | null
}

export default function PlaylistDropdown({ mediaId, mediaType, mediaTitle, posterPath }: PlaylistDropdownProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
        <ListPlus className="h-4 w-4 mr-1" />
        Add to Playlist
      </Button>
      <AddToPlaylistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mediaId={mediaId}
        mediaType={mediaType}
        mediaTitle={mediaTitle}
        posterPath={posterPath}
      />
    </>
  )
}
