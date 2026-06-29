'use client'

import { useState, useMemo } from 'react'
import { Banknote, CreditCard, Smartphone, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  total: number
  onConfirm: (paymentMethod: string, customerId?: string) => void
}

interface Customer {
  id: string
  name: string
}

const paymentMethods = [
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { id: 'cartao_credito', label: 'Crédito', icon: CreditCard },
  { id: 'cartao_debito', label: 'Débito', icon: CreditCard },
  { id: 'pix', label: 'PIX', icon: Smartphone },
  { id: 'fiado', label: 'Fiado', icon: User },
]

const mockCustomers: Customer[] = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Pedro Oliveira' },
]

export function PaymentModal({ open, onClose, total, onConfirm }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [amountTendered, setAmountTendered] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const change = useMemo(() => {
    if (selectedMethod !== 'dinheiro') return 0
    const tendered = parseFloat(amountTendered) || 0
    return Math.max(0, tendered - total)
  }, [selectedMethod, amountTendered, total])

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return mockCustomers
    const term = customerSearch.toLowerCase()
    return mockCustomers.filter((c) => c.name.toLowerCase().includes(term))
  }, [customerSearch])

  const canConfirm = () => {
    if (!selectedMethod) return false
    if (selectedMethod === 'dinheiro') {
      const tendered = parseFloat(amountTendered) || 0
      return tendered >= total
    }
    if (selectedMethod === 'fiado') {
      return selectedCustomer !== null
    }
    return true
  }

  const handleConfirm = () => {
    if (!canConfirm()) return
    onConfirm(selectedMethod, selectedCustomer?.id)
    setSelectedMethod('')
    setAmountTendered('')
    setCustomerSearch('')
    setSelectedCustomer(null)
  }

  const handleClose = () => {
    onClose()
    setSelectedMethod('')
    setAmountTendered('')
    setCustomerSearch('')
    setSelectedCustomer(null)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80" onClick={handleClose} />
      <div className="relative z-50 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-semibold">Pagamento</h2>
          <p className="text-sm text-muted-foreground">Selecione o método de pagamento</p>
        </div>

        <div className="mb-6 p-4 rounded-lg bg-muted text-center">
          <p className="text-sm text-muted-foreground">Total a pagar</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(total)}</p>
        </div>

        <div className="space-y-2 mb-6">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <button
                key={method.id}
                onClick={() => {
                  setSelectedMethod(method.id)
                  setSelectedCustomer(null)
                  setCustomerSearch('')
                }}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                  selectedMethod === method.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-muted-foreground/30'
                }`}
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{method.label}</span>
              </button>
            )
          })}
        </div>

        {selectedMethod === 'dinheiro' && (
          <div className="space-y-2 mb-6">
            <Label htmlFor="amount-tendered">Valor recebido</Label>
            <Input
              id="amount-tendered"
              type="number"
              step="0.01"
              min={total}
              placeholder={total.toFixed(2)}
              value={amountTendered}
              onChange={(e) => setAmountTendered(e.target.value)}
            />
            {change > 0 && (
              <p className="text-sm text-emerald-600 font-medium">
                Troco: {formatCurrency(change)}
              </p>
            )}
          </div>
        )}

        {selectedMethod === 'fiado' && (
          <div className="space-y-2 mb-6">
            <Label>Buscar cliente</Label>
            <Input
              placeholder="Nome do cliente..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            <div className="max-h-40 overflow-y-auto rounded-lg border divide-y">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`flex w-full items-center gap-2 p-3 text-left text-sm transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-primary/10'
                      : 'hover:bg-muted'
                  }`}
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  {customer.name}
                </button>
              ))}
            </div>
            {selectedCustomer && (
              <p className="text-sm text-muted-foreground">
                Cliente selecionado: <span className="font-medium text-foreground">{selectedCustomer.name}</span>
              </p>
            )}
          </div>
        )}

        <Button
          onClick={handleConfirm}
          disabled={!canConfirm()}
          className="w-full h-12 text-base"
        >
          Confirmar Pagamento
        </Button>
      </div>
    </div>
  )
}
