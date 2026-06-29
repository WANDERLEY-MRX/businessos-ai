'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal'
import { EmptyState } from '@/components/shared/empty-state'
import { PageLoading } from '@/components/shared/loading'
import { getServiceOrders, deleteServiceOrder } from '@/lib/store'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { ServiceOrder, OSStatus } from '@/lib/types'
import { Search, Plus, Wrench, Pencil, Trash2 } from 'lucide-react'

const STATUS_TABS: { label: string; value: OSStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Aberto', value: 'aberto' },
  { label: 'Em Andamento', value: 'em_andamento' },
  { label: 'Aguardando Peça', value: 'aguardando_peca' },
  { label: 'Concluído', value: 'concluido' },
  { label: 'Entregue', value: 'entregue' },
]

const STATUS_COLORS: Record<OSStatus, string> = {
  aberto: 'bg-blue-100 text-blue-800',
  em_andamento: 'bg-yellow-100 text-yellow-800',
  aguardando_peca: 'bg-orange-100 text-orange-800',
  concluido: 'bg-green-100 text-green-800',
  entregue: 'bg-purple-100 text-purple-800',
}

const STATUS_LABELS: Record<OSStatus, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em Andamento',
  aguardando_peca: 'Aguardando Peça',
  concluido: 'Concluído',
  entregue: 'Entregue',
}

export default function OSPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OSStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<ServiceOrder | null>(null)

  useEffect(() => {
    const data = getServiceOrders()
    setOrders(data)
    setLoading(false)
  }, [])

  const filteredOrders = useMemo(() => {
    let result = orders
    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          o.number.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.deviceType.toLowerCase().includes(q) ||
          o.brand.toLowerCase().includes(q) ||
          o.model.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, search, statusFilter])

  const handleDelete = () => {
    if (orderToDelete) {
      deleteServiceOrder(orderToDelete.id)
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id))
      setDeleteModalOpen(false)
      setOrderToDelete(null)
    }
  }

  const openDeleteModal = (order: ServiceOrder) => {
    setOrderToDelete(order)
    setDeleteModalOpen(true)
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerencie suas ordens de serviço</p>
        </div>
        <Link href="/os/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova OS
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Input
            placeholder="Buscar por nº OS, cliente, dispositivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <EmptyState
              icon={<Wrench className="h-6 w-6" />}
              title="Nenhuma ordem de serviço encontrada"
              description={
                search || statusFilter !== 'all'
                  ? 'Tente outro termo de busca ou filtro'
                  : 'Comece criando sua primeira ordem de serviço'
              }
              action={
                !search && statusFilter === 'all'
                  ? {
                      label: 'Nova OS',
                      onClick: () => router.push('/os/nova'),
                    }
                  : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nº OS</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Dispositivo</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden sm:table-cell">Valor</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">#{order.number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.customerName}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {order.brand} {order.model}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_COLORS[order.status]}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        {formatCurrency(order.totalValue)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/os/detalhe?id=${order.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteModal(order)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
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
          <ModalHeader>
            <ModalTitle>Excluir Ordem de Serviço</ModalTitle>
            <ModalDescription>
              Tem certeza que deseja excluir a OS{' '}
              <strong>#{orderToDelete?.number}</strong>? Esta ação não pode ser desfeita.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
