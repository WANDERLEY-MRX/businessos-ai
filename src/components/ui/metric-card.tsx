"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { type LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: { value: number; positive: boolean }
  className?: string
  loading?: boolean
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  loading,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className={cn("rounded-xl border bg-card p-6", className)}>
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span
            className={cn(
              "text-sm font-medium",
              trend.positive ? "text-emerald-600" : "text-red-600"
            )}
          >
            {trend.positive ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">vs mês anterior</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  )
}
