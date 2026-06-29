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
import { getServiceOrder, updateServiceOrder, updateOSStatus, deleteServiceOrder, getSettings } from '@/lib/store'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { printOS } from '@/lib/print'
import { ServiceOrder, OSStatus } from '@/lib/types'
import { ArrowLeft, Save, Trash2, Printer, Edit, Check, Clock, AlertTriangle, Package, User, Smartphone, ChevronRight } from 'lucide-react'

const STATUS_COLORS: Record<OSStatus, string> = {
  aberto: 'bg-blue-100 text-blue-800',
  em_andamento: 'bg-yellow-100 text-yellow-800',
  aguardando_peca: 'bg-orange-100 text-orange-800',
  concluido: 'bg-green-100 text-green-800',
  entregue: 'bg-purple-100 text-purple-800',
}
const STATUS_LABELS: Record<OSStatus, string> = { aberto: 'Aberto', em_andamento: 'Em Andamento', aguardando_peca: 'Aguardando Peca', concluido: 'Concluido', entregue: 'Entregue' }
const DEVICE_TYPES = ['Notebook', 'Celular', 'Tablet', 'TV', 'Monitor', 'Outro']

function getNextStatuses(current: OSStatus): { status: OSStatus; label: string; icon: React.ReactNode }[] {
  switch (current) {
    case 'aberto': return [{ status: 'em_andamento', label: 'Iniciar Atendimento', icon: <Check className="h-4 w-4" /> }]
    case 'em_andamento': return [
      { status: 'aguardando_peca', label: 'Aguardando Peca', icon: <Package className="h-4 w-4" /> },
      { status: 'concluido', label: 'Concluir', icon: <Check className="h-4 w-4" /> },
    ]
    case 'aguardando_peca': return [
      { status: 'em_andamento', label: 'Retomar', icon: <Check className="h-4 w-4" /> },
      { status: 'concluido', label: 'Concluir', icon: <Check className="h-4 w-4" /> },
    ]
    case 'concluido': return [{ status: 'entregue', label: 'Entregar', icon: <ChevronRight className="h-4 w-4" /> }]
    case 'entregue': return []
  }
}

function OSDetailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [form, setForm] = useState({ deviceType: '', brand: '', model: '', serialNumber: '', reportedDefect: '', technicalReport: '', partsUsed: '', serviceValue: '', partsValue: '' })

  useEffect(() => {
    if (!id) { router.push('/os'); return }
    const o = getServiceOrder(id)
    if (!o) { router.push('/os'); return }
    setOrder(o)
    setForm({ deviceType: o.deviceType, brand: o.brand, model: o.model, serialNumber: o.serialNumber || '', reportedDefect: o.reportedDefect, technicalReport: o.technicalReport || '', partsUsed: o.partsUsed || '', serviceValue: String(o.serviceValue), partsValue: String(o.partsValue) })
    setLoading(false)
  }, [id, router])

  const handleChange = (field: string, value: string) => { setForm((prev) => ({ ...prev, [field]: value })) }

  const handleSave = () => {
    if (!order || !id) return
    const sv = parseFloat(form.serviceValue) || 0, pv = parseFloat(form.partsValue) || 0
    updateServiceOrder(order.id, { deviceType: form.deviceType, brand: form.brand.trim(), model: form.model.trim(), serialNumber: form.serialNumber.trim() || undefined, reportedDefect: form.reportedDefect.trim(), technicalReport: form.technicalReport.trim() || undefined, partsUsed: form.partsUsed.trim() || undefined, serviceValue: sv, partsValue: pv, totalValue: sv + pv })
    const updated = getServiceOrder(id); if (updated) setOrder(updated); setEditMode(false)
  }

  const handleStatusChange = (ns: OSStatus) => {
    if (!order || !id) return
    updateOSStatus(order.id, ns); const updated = getServiceOrder(id); if (updated) setOrder(updated)
  }

  const handleDelete = () => { if (!id) return; deleteServiceOrder(id); router.push('/os') }
  const handlePrint = () => { if (order) printOS(order, getSettings()) }

  if (loading || !order) return <PageLoading />

  const nextStatuses = getNextStatuses(order.status)
  const totalValue = (parseFloat(form.serviceValue) || 0) + (parseFloat(form.partsValue) || 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/os"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1"><h1 className="text-2xl font-bold tracking-tight">OS #{order.number}</h1><p className="text-muted-foreground">{order.customerName}</p></div>
        <Badge className={STATUS_COLORS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Imprimir</Button>
        {!editMode && <Button variant="outline" onClick={() => setEditMode(true)}><Edit className="mr-2 h-4 w-4" />Editar</Button>}
        <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Excluir</Button>
      </div>
      {nextStatuses.length > 0 && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Avancar Status</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{nextStatuses.map((n) => <Button key={n.status} onClick={() => handleStatusChange(n.status)}>{n.icon}<span className="ml-2">{n.label}</span></Button>)}</div></CardContent>
        </Card>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {editMode ? (
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />Editar Dispositivo</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-1.5 block text-sm font-medium">Tipo</label>
                    <select value={form.deviceType} onChange={(e) => handleChange('deviceType', e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{DEVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
                  <Input label="Marca" value={form.brand} onChange={(e) => handleChange('brand', e.target.value)} />
                  <Input label="Modelo" value={form.model} onChange={(e) => handleChange('model', e.target.value)} />
                  <Input label="No Serie" value={form.serialNumber} onChange={(e) => handleChange('serialNumber', e.target.value)} />
                </div>
                <div><label className="mb-1.5 block text-sm font-medium">Defeito Relatado</label><textarea className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.reportedDefect} onChange={(e) => handleChange('reportedDefect', e.target.value)} /></div>
                <div><label className="mb-1.5 block text-sm font-medium">Laudo Tecnico</label><textarea className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.technicalReport} onChange={(e) => handleChange('technicalReport', e.target.value)} /></div>
                <div><label className="mb-1.5 block text-sm font-medium">Pecas</label><textarea className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.partsUsed} onChange={(e) => handleChange('partsUsed', e.target.value)} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Mao de Obra (R$)" type="number" step="0.01" min="0" value={form.serviceValue} onChange={(e) => handleChange('serviceValue', e.target.value)} />
                  <Input label="Pecas (R$)" type="number" step="0.01" min="0" value={form.partsValue} onChange={(e) => handleChange('partsValue', e.target.value)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3"><span className="font-medium">Total</span><span className="text-lg font-bold">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                <div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => setEditMode(false)}>Cancelar</Button><Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Salvar</Button></div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />Dispositivo</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Tipo</span><span className="text-sm font-medium">{order.deviceType}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Marca</span><span className="text-sm font-medium">{order.brand}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Modelo</span><span className="text-sm font-medium">{order.model}</span></div>
                  {order.serialNumber && <div className="flex justify-between"><span className="text-sm text-muted-foreground">No Serie</span><span className="text-sm font-medium">{order.serialNumber}</span></div>}
                </CardContent>
              </Card>
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Defeito Relatado</CardTitle></CardHeader><CardContent><p className="text-sm whitespace-pre-wrap">{order.reportedDefect}</p></CardContent></Card>
              {order.technicalReport && <Card><CardHeader><CardTitle>Laudo Tecnico</CardTitle></CardHeader><CardContent><p className="text-sm whitespace-pre-wrap">{order.technicalReport}</p></CardContent></Card>}
              {order.partsUsed && <Card><CardHeader><CardTitle>Pecas</CardTitle></CardHeader><CardContent><p className="text-sm whitespace-pre-wrap">{order.partsUsed}</p></CardContent></Card>}
              <Card><CardHeader><CardTitle>Valores</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Mao de Obra</span><span className="text-sm font-medium">{formatCurrency(order.serviceValue)}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Pecas</span><span className="text-sm font-medium">{formatCurrency(order.partsValue)}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-medium">Total</span><span className="text-lg font-bold">{formatCurrency(order.totalValue)}</span></div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium">{order.customerName}</p>
              <p className="text-sm text-muted-foreground">Criada em {formatDateTime(order.createdAt)}</p>
              {order.updatedAt !== order.createdAt && <p className="text-sm text-muted-foreground">Atualizada em {formatDateTime(order.updatedAt)}</p>}
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Historico</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory.map((entry, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${i === order.statusHistory.length - 1 ? 'bg-primary' : 'bg-muted'}`} />
                      {i < order.statusHistory.length - 1 && <div className="h-full w-0.5 bg-border" />}
                    </div>
                    <div className="pb-4"><p className="text-sm font-medium">{STATUS_LABELS[entry.status]}</p><p className="text-xs text-muted-foreground">{formatDateTime(entry.date)}</p>{entry.note && <p className="text-xs text-muted-foreground mt-1">{entry.note}</p>}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader><ModalTitle>Excluir OS</ModalTitle><ModalDescription>Excluir OS <strong>#{order.number}</strong>? Nao pode ser desfeita.</ModalDescription></ModalHeader>
          <ModalFooter><Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={handleDelete}>Excluir</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default function OSDetailPage() {
  return <Suspense fallback={<PageLoading />}><OSDetailForm /></Suspense>
}
