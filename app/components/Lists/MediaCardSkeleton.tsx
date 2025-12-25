export default function MediaCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="relative aspect-video rounded-xl bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2">
        {/* Title lines */}
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-3/4" />

        {/* Meta info */}
        <div className="flex items-center gap-2">
          <div className="h-3 bg-muted rounded w-12" />
          <div className="h-3 bg-muted rounded w-16" />
        </div>
      </div>
    </div>
  )
}
