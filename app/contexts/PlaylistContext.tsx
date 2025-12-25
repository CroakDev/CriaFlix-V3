"use client"

import { createContext, useContext, ReactNode } from "react"

interface PlaylistContextType {
  refreshPlaylists: () => void
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined)

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const refreshPlaylists = () => {
    // This will be overridden by the actual implementation
    window.dispatchEvent(new CustomEvent('refreshPlaylists'))
  }

  return (
    <PlaylistContext.Provider value={{ refreshPlaylists }}>
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylistContext() {
  const context = useContext(PlaylistContext)
  if (context === undefined) {
    throw new Error('usePlaylistContext must be used within a PlaylistProvider')
  }
  return context
}
