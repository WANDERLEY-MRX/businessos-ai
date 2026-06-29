'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal'
import { createServiceOrder, searchCustomers } from '@/lib/store'
import { formatPhone } from '@/lib/utils'
import { Customer } from '@/lib/types'
import { ArrowLeft, Save, Search, User, Smartphone, AlertTriangle } from 'lucide-react'

const DEVICE_TYPES = ['Notebook', 'Celular', 'Tablet', 'TV', 'Monitor', 'Outro']

export default function NovaOSPage() {
  const router = useRouter()
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    deviceType: 'Notebook',
    brand: '',
    model: '',
    serialNumber: '',
    reportedDefect: '',
    technicalReport: '',
    partsUsed: '',
    serviceValue: '',
    partsValue: '',
  })

  useEffect(() => {
    if (customerSearch.trim().length > 0) {
      const results = searchCustomers(customerSearch)
      setCustomers(results)
      setShowCustomerModal(true)
    } else {
      setCustomers([])
      setShowCustomerModal(false)
    }
  }, [customerSearch])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearch('')
    setShowCustomerModal(false)
    if (errors.customer) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.customer
        return next
      })
    }
  }

  const handleRemoveCustomer = () => {
    setSelectedCustomer(null)
  }

  const totalValue = (parseFloat(form.serviceValue) || 0) + (parseFloat(form.partsValue) || 0)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!selectedCustomer) newErrors.customer = 'Selecione um cliente'
    if (!form.brand.trim()) newErrors.brand = 'Marca é obrigatória'
    if (!form.model.trim()) newErrors.model = 'Modelo é obrigatório'
    if (!form.reportedDefect.trim()) newErrors.reportedDefect = 'Defeito relatado é obrigatório'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !selectedCustomer) return
    createServiceOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      deviceType: form.deviceType,
      brand: form.brand.trim(),
      model: form.model.trim(),
      serialNumber: form.serialNumber.trim() || undefined,
      reportedDefect: form.reportedDefect.trim(),
      technicalReport: form.technicalReport.trim() || undefined,
      partsUsed: form.partsUsed.trim() || undefined,
      status: 'aberto',
      serviceValue: parseFloat(form.serviceValue) || 0,
      partsValue: parseFloat(form.partsValue) || 0,
      totalValue,
    })
    router.push('/os')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/os">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Ordem de Serviço</h1>
          <p className="text-muted-foreground">Crie uma nova ordem de serviço</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPhone(selectedCustomer.phone)}
                    {selectedCustomer.email ? ` • ${selectedCustomer.email}` : ''}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleRemoveCustomer}>
                  Trocar
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Buscar cliente por nome ou telefone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                  error={errors.customer}
                />
                {showCustomerModal && customers.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border bg-background shadow-lg">
                    {customers.slice(0, 8).map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{formatPhone(customer.phone)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showCustomerModal && customerSearch && customers.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border bg-background p-4 text-center shadow-lg">
                    <p className="text-sm text-muted-foreground">Nenhum cliente encontrado</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Dados do Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Tipo de Dispositivo
                </label>
                <select
                  value={form.deviceType}
                  onChange={(e) => handleChange('deviceType', e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {DEVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Marca *"
                value={form.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                error={errors.brand}
                placeholder="Ex: Samsung, Apple, Dell"
              />
              <Input
                label="Modelo *"
                value={form.model}
                onChange={(e) => handleChange('model', e.target.value)}
                error={errors.model}
                placeholder="Ex: Galaxy S24, iPhone 15"
              />
              <Input
                label="Nº Série"
                value={form.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                placeholder="Número de série"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Defeito e Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Defeito Relatado *
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.reportedDefect}
                onChange={(e) => handleChange('reportedDefect', e.target.value)}
                placeholder="Descreva o defeito relatado pelo cliente..."
              />
              {errors.reportedDefect && (
                <p className="mt-1 text-sm text-destructive">{errors.reportedDefect}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Laudo Técnico
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.technicalReport}
                onChange={(e) => handleChange('technicalReport', e.target.value)}
                placeholder="Laudo técnico do atendimento..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Peças Utilizadas
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.partsUsed}
                onChange={(e) => handleChange('partsUsed', e.target.value)}
                placeholder="Liste as peças utilizadas no serviço..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Valor Mão de Obra (R$)"
                type="number"
                step="0.01"
                min="0"
                value={form.serviceValue}
                onChange={(e) => handleChange('serviceValue', e.target.value)}
                placeholder="0,00"
              />
              <Input
                label="Valor Peças (R$)"
                type="number"
                step="0.01"
                min="0"
                value={form.partsValue}
                onChange={(e) => handleChange('partsValue', e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold">
                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/os">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Salvar OS
          </Button>
        </div>
      </form>
    </div>
  )
}
