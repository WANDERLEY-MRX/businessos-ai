'use client'

import { useState, useMemo } from 'react'
import { Search, Package, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  code: string
  brand?: string
  price: number
  stock: number
  category?: string
}

interface ProductGridProps {
  products: Product[]
  onSelect: (product: Product) => void
}

export function ProductGrid({ products, onSelect }: ProductGridProps) {
  const [search, setSearch] = useState('')

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products
    const term = search.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term)
    )
  }, [products, search])

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente buscar por outro termo
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => onSelect(product)}
                className="flex flex-col items-start gap-2 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {product.code}
                  </span>
                  {product.stock <= 5 && product.stock > 0 && (
                    <Badge variant="warning" className="flex items-center gap-1 text-[10px] px-1.5 py-0">
                      <AlertTriangle className="h-3 w-3" />
                      Estoque baixo
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      Sem estoque
                    </Badge>
                  )}
                </div>
                <div className="w-full">
                  <p className="font-medium text-sm leading-tight line-clamp-2">{product.name}</p>
                  {product.brand && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{product.brand}</p>
                  )}
                </div>
                <p className="mt-auto text-base font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Estoque: {product.stock}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
