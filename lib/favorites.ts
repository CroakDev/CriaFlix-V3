import { toast } from "@/components/ui/use-toast"

export async function toggleFavorites(
  mediaId: number,
  setIsInFavorites: (value: boolean) => void,
  mediaType: "movie" | "tv" = "movie",
  mediaTitle?: string,
  posterPath?: string,
) {
  try {
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: mediaType,
        id: mediaId,
        title: mediaTitle,
        posterPath: posterPath,
      }),
    })

    const data = await response.json()

    if (data.action === "added") {
      setIsInFavorites(true)
      toast({
        title: "Adicionado",
        description: "Item adicionado aos favoritos",
      })
    } else {
      setIsInFavorites(false)
      toast({
        title: "Removido",
        description: "Item removido dos favoritos",
      })
    }
  } catch (error) {
    toast({
      title: "Erro",
      description: "Não foi possível atualizar os favoritos",
      variant: "destructive",
    })
  }
}
