'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal'
import { EmptyState } from '@/components/shared/empty-state'
import { PageLoading } from '@/components/shared/loading'
import { getCustomers, searchCustomers, deleteCustomer, getSalesByCustomer, getOSByCustomer } from '@/lib/store'
import { formatCPF, formatPhone, formatCurrency } from '@/lib/utils'
import { Customer } from '@/lib/types'
import { Search, Plus, Users, Pencil, Trash2 } from 'lucide-react'

export default function ClientesPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  useEffect(() => {
    const data = search ? searchCustomers(search) : getCustomers()
    setCustomers(data)
    setLoading(false)
  }, [search])

  const getCustomerTotalSpent = (customerId: string) => {
    const sales = getSalesByCustomer(customerId)
    return sales
      .filter((s) => s.status === 'concluida')
      .reduce((sum, s) => sum + s.total, 0)
  }

  const handleDelete = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id)
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id))
      setDeleteModalOpen(false)
      setCustomerToDelete(null)
    }
  }

  const openDeleteModal = (customer: Customer) => {
    setCustomerToDelete(customer)
    setDeleteModalOpen(true)
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
        <Link href="/clientes/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por nome, CPF ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="Nenhum cliente encontrado"
              description={search ? 'Tente outro termo de busca' : 'Comece adicionando seu primeiro cliente'}
              action={
                !search
                  ? {
                      label: 'Novo Cliente',
                      onClick: () => router.push('/clientes/novo'),
                    }
                  : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-hidden">CPF</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telefone</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total Gasto</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => {
                    const totalSpent = getCustomerTotalSpent(customer.id)
                    return (
                      <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{customer.name}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatCPF(customer.cpf)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatPhone(customer.phone)}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{customer.email || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant={totalSpent > 0 ? 'success' : 'secondary'}>
                            {formatCurrency(totalSpent)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/clientes/editar?id=${customer.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteModal(customer)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Excluir Cliente</ModalTitle>
            <ModalDescription>
              Tem certeza que deseja excluir o cliente{' '}
              <strong>{customerToDelete?.name}</strong>? Esta ação não pode ser desfeita.
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
