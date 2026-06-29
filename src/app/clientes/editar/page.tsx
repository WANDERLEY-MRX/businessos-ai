'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal'
import { PageLoading } from '@/components/shared/loading'
import { EmptyState } from '@/components/shared/empty-state'
import { getCustomer, updateCustomer, deleteCustomer, getSalesByCustomer, getOSByCustomer } from '@/lib/store'
import { formatDateTime, getOSStatusLabel, getOSStatusColor } from '@/lib/utils'
import { Customer, Sale, ServiceOrder } from '@/lib/types'
import { ArrowLeft, Save, Trash2, User, ShoppingCart, Wrench } from 'lucide-react'

function EditarClienteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', cpf: '', phone: '', email: '', address: '', city: '', state: '', notes: '' })

  useEffect(() => {
    if (!id) { router.push('/clientes'); return }
    const c = getCustomer(id)
    if (!c) { router.push('/clientes'); return }
    setCustomer(c)
    setForm({ name: c.name, cpf: c.cpf, phone: c.phone, email: c.email || '', address: c.address || '', city: c.city || '', state: c.state || '', notes: c.notes || '' })
    setSales(getSalesByCustomer(id))
    setServiceOrders(getOSByCustomer(id))
    setLoading(false)
  }, [id, router])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) { setErrors((prev) => { const next = { ...prev }; delete next[field]; return next }) }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Nome e obrigatorio'
    if (!form.cpf.trim()) e.cpf = 'CPF e obrigatorio'
    if (!form.phone.trim()) e.phone = 'Telefone e obrigatorio'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate() || !id) return
    updateCustomer(id, { name: form.name.trim(), cpf: form.cpf.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined, address: form.address.trim() || undefined, city: form.city.trim() || undefined, state: form.state.trim() || undefined, notes: form.notes.trim() || undefined })
    router.push('/clientes')
  }

  const handleDelete = () => { if (!id) return; deleteCustomer(id); router.push('/clientes') }
  const totalSpent = sales.filter((s) => s.status === 'concluida').reduce((sum, s) => sum + s.total, 0)

  if (loading || !customer) return <PageLoading />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1"><h1 className="text-2xl font-bold tracking-tight">Editar Cliente</h1><p className="text-muted-foreground">{customer.name}</p></div>
        <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Excluir</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Dados do Cliente</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Nome *" value={form.name} onChange={(e) => handleChange('name', e.target.value)} error={errors.name} placeholder="Nome completo" />
                  <Input label="CPF *" value={form.cpf} onChange={(e) => handleChange('cpf', e.target.value)} error={errors.cpf} placeholder="000.000.000-00" />
                  <Input label="Telefone *" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} error={errors.phone} placeholder="(00) 00000-0000" />
                  <Input label="Email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="email@exemplo.com" />
                </div>
                <Input label="Endereco" value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Rua, numero" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Cidade" value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
                  <Input label="Estado" value={form.state} onChange={(e) => handleChange('state', e.target.value)} placeholder="UF" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Observacoes</label>
                  <textarea className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <Link href="/clientes"><Button type="button" variant="outline">Cancelar</Button></Link>
                  <Button type="submit"><Save className="mr-2 h-4 w-4" />Salvar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total Gasto</span><Badge variant="success">R$ {totalSpent.toFixed(2)}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Vendas</span><span className="text-sm font-medium">{sales.length}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">OS</span><span className="text-sm font-medium">{serviceOrders.length}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Cliente desde</span><span className="text-sm font-medium">{new Date(customer.createdAt).toLocaleDateString('pt-BR')}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Historico de Compras</CardTitle></CardHeader>
        <CardContent>
          {sales.length === 0 ? <EmptyState icon={<ShoppingCart className="h-6 w-6" />} title="Nenhuma compra" description="Este cliente ainda nao realizou nenhuma compra" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="px-4 py-3 text-left font-medium text-muted-foreground">N Venda</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th><th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th></tr></thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">#{sale.number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDateTime(sale.createdAt)}</td>
                      <td className="px-4 py-3"><Badge variant={sale.status === 'concluida' ? 'success' : 'warning'}>{sale.status === 'concluida' ? 'Concluida' : 'Fiado'}</Badge></td>
                      <td className="px-4 py-3 text-right font-medium">R$ {sale.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />Historico de OS</CardTitle></CardHeader>
        <CardContent>
          {serviceOrders.length === 0 ? <EmptyState icon={<Wrench className="h-6 w-6" />} title="Nenhuma OS" description="Este cliente ainda nao possui ordens de servico" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="px-4 py-3 text-left font-medium text-muted-foreground">N OS</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th><th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th></tr></thead>
                <tbody>
                  {serviceOrders.map((os) => (
                    <tr key={os.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">#{os.number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDateTime(os.createdAt)}</td>
                      <td className="px-4 py-3"><Badge className={getOSStatusColor(os.status)}>{getOSStatusLabel(os.status)}</Badge></td>
                      <td className="px-4 py-3 text-right font-medium">R$ {os.totalValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader><ModalTitle>Excluir Cliente</ModalTitle><ModalDescription>Tem certeza que deseja excluir <strong>{customer.name}</strong>?</ModalDescription></ModalHeader>
          <ModalFooter><Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={handleDelete}>Excluir</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default function EditarClientePage() {
  return <Suspense fallback={<PageLoading />}><EditarClienteForm /></Suspense>
}
