'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Pencil, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal'
import { EmptyState } from '@/components/shared/empty-state'
import { getProducts, deleteProduct, searchProducts } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/lib/types'

const categories = [
  { value: '', label: 'Todas as categorias' },
  { value: 'acessorios', label: 'Acessorios' },
  { value: 'componentes', label: 'Componentes' },
  { value: 'eletronicos', label: 'Eletronicos' },
  { value: 'ferramentas', label: 'Ferramentas' },
  { value: 'material_escritorio', label: 'Material de Escritorio' },
  { value: 'moveis', label: 'Moveis' },
  { value: 'outros', label: 'Outros' },
  { value: 'peças', label: 'Pecas' },
  { value: 'suprimentos', label: 'Suprimentos' },
  { value: 'telefonia', label: 'Telefonia' },
]

export default function ProdutosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [deleteModal, setDeleteModal] = useState<Product | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [search, category])

  function loadProducts() {
    setLoading(true)
    let items = search ? searchProducts(search) : getProducts()
    if (category) {
      items = items.filter((p) => p.category === category)
    }
    setProducts(items)
    setLoading(false)
  }

  function handleDelete() {
    if (!deleteModal) return
    deleteProduct(deleteModal.id)
    setDeleteModal(null)
    loadProducts()
  }

  function isLowStock(product: Product) {
    return product.currentStock <= product.minStock
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seu estoque de produtos</p>
        </div>
        <Button onClick={() => router.push('/produtos/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou codigo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            options={categories}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6 text-muted-foreground" />}
          title="Nenhum produto encontrado"
          description={
            search || category
              ? 'Tente ajustar os filtros de busca'
              : 'Comece cadastrando seu primeiro produto'
          }
          action={
            !search && !category
              ? { label: 'Novo Produto', onClick: () => router.push('/produtos/novo') }
              : undefined
          }
        />
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Codigo</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Marca</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Preco Venda</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Estoque</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{product.code}</td>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{product.brand}</td>
                    <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(product.sellPrice)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{product.currentStock}</span>
                        {isLowStock(product) && (
                          <Badge variant="destructive">Estoque Baixo</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/produtos/editar?id=${product.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteModal(product)}
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
        </div>
      )}

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Excluir Produto</ModalTitle>
            <ModalDescription>
              Tem certeza que deseja excluir o produto{' '}
              <strong>{deleteModal?.name}</strong>? Esta acao nao pode ser desfeita.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="outline" onClick={() => setDeleteModal(null)}>
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
