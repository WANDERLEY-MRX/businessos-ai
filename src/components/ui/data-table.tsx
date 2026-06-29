"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Loading } from "@/components/shared/loading"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"

export interface Column<T> {
  key: string
  header: string
  cell?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[] | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  searchable?: boolean
  searchKeys?: (keyof T)[]
  searchPlaceholder?: string
  onRowClick?: (item: T) => void
  keyExtractor: (item: T) => string
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: { label: string; onClick: () => void }
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  error,
  onRetry,
  searchable = false,
  searchKeys,
  searchPlaceholder = "Buscar...",
  onRowClick,
  keyExtractor,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription,
  emptyAction,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const filtered = useMemo(() => {
    if (!data) return []
    if (!search || !searchKeys) return data
    const q = search.toLowerCase()
    return data.filter((item) =>
      searchKeys.some((key) => {
        const val = item[key]
        return val != null && String(val).toLowerCase().includes(q)
      })
    )
  }, [data, search, searchKeys])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = String(aVal).localeCompare(String(bVal), "pt-BR")
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border">
        <Loading text="Carregando dados..." />
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}
      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      col.sortable && "cursor-pointer select-none hover:text-foreground",
                      col.className
                    )}
                    onClick={() => col.sortable && toggleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && (
                        <span className="inline-flex flex-col">
                          {sortKey === col.key ? (
                            sortDir === "asc" ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                    />
                  </td>
                </tr>
              ) : (
                sorted.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    className={cn(
                      "transition-colors hover:bg-muted/30",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn("whitespace-nowrap px-4 py-3 text-sm", col.className)}
                      >
                        {col.cell ? col.cell(item) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {sorted.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {sorted.length} registro{sorted.length !== 1 ? "s" : ""}
          {search && ` (filtrado de ${data?.length || 0})`}
        </p>
      )}
    </div>
  )
}
