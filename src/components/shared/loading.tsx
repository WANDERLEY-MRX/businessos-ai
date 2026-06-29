import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
}

export function Loading({ className, size = "md", text }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          sizeClasses[size]
        )}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loading size="lg" text="Carregando..." />
    </div>
  )
}

export function CardLoading() {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
    </div>
  )
}
