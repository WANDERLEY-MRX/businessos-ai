'use client'

import { Trash2, Plus, Minus, ShoppingCart, CreditCard, Banknote, Smartphone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'

export interface CartItem {
  productId: string
  productName: string
  productCode: string
  quantity: number
  unitPrice: number
  total: number
}

interface CartProps {
  items: CartItem[]
  onRemove: (index: number) => void
  onUpdateQuantity: (index: number, quantity: number) => void
  onClear: () => void
  onFinalize?: () => void
}

const paymentMethods = [
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { id: 'cartao_credito', label: 'Crédito', icon: CreditCard },
  { id: 'cartao_debito', label: 'Débito', icon: CreditCard },
  { id: 'pix', label: 'PIX', icon: Smartphone },
  { id: 'fiado', label: 'Fiado', icon: User },
]

export function Cart({ items, onRemove, onUpdateQuantity, onClear, onFinalize }: CartProps) {
  const subtotal = items.reduce((acc, item) => acc + item.total, 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="font-semibold">Venda</h2>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Carrinho vazio</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Selecione produtos para iniciar a venda
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.productCode}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)} un.</p>
                    <p className="font-semibold text-sm">{formatCurrency(item.total)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(subtotal)}</span>
            </div>
          </div>
          <Button onClick={onFinalize} className="w-full h-12 text-base">
            Finalizar Venda
          </Button>
        </div>
      )}
    </div>
  )
}
