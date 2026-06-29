"use client"

import { useState, useEffect } from "react"
import { WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground shadow-lg"
      )}
    >
      <WifiOff className="h-4 w-4" />
      <span>Você está offline</span>
    </div>
  )
}
