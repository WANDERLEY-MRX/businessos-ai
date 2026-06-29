'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal'
import { getProduct, updateProduct, deleteProduct } from '@/lib/store'

const categoryOptions = [
  { value: 'acessorios', label: 'Acessorios' },
  { value: 'componentes', label: 'Componentes' },
  { value: 'eletronicos', label: 'Eletronicos' },
  { value: 'ferramentas', label: 'Ferramentas' },
  { value: 'material_escritorio', label: 'Material de Escritorio' },
  { value: 'moveis', label: 'Moveis' },
  { value: 'outros', label: 'Outros' },
  { value: 'pecas', label: 'Pecas' },
  { value: 'suprimentos', label: 'Suprimentos' },
  { value: 'telefonia', label: 'Telefonia' },
]

function EditProdutoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteModal, setDeleteModal] = useState(false)
  const [form, setForm] = useState({
    code: '', name: '', brand: '', category: 'outros', description: '', costPrice: '', sellPrice: '', minStock: '', currentStock: '',
  })

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return }
    const product = getProduct(id)
    if (!product) { setNotFound(true); setLoading(false); return }
    setForm({
      code: product.code, name: product.name, brand: product.brand, category: product.category,
      description: product.description || '', costPrice: product.costPrice.toString(),
      sellPrice: product.sellPrice.toString(), minStock: product.minStock.toString(),
      currentStock: product.currentStock.toString(),
    })
    setLoading(false)
  }, [id])

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) { setErrors((prev) => { const next = { ...prev }; delete next[field]; return next }) }
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.code.trim()) e.code = 'Codigo e obrigatorio'
    if (!form.name.trim()) e.name = 'Nome e obrigatorio'
    if (!form.brand.trim()) e.brand = 'Marca e obrigatoria'
    if (!form.category) e.category = 'Categoria e obrigatoria'
    if (!form.sellPrice || parseFloat(form.sellPrice) < 0) e.sellPrice = 'Preco de venda e obrigatorio'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate() || !id) return
    setSaving(true)
    try {
      updateProduct(id, {
        code: form.code.trim(), name: form.name.trim(), brand: form.brand.trim(),
        category: form.category, description: form.description.trim(),
        costPrice: parseFloat(form.costPrice) || 0, sellPrice: parseFloat(form.sellPrice) || 0,
        minStock: parseInt(form.minStock) || 0, currentStock: parseInt(form.currentStock) || 0,
      })
      router.push('/produtos')
    } finally { setSaving(false) }
  }

  function handleDelete() {
    if (!id) return
    deleteProduct(id); setDeleteModal(false); router.push('/produtos')
  }

  if (loading) return <div className="max-w-2xl space-y-6"><div className="h-8 w-48 bg-muted animate-pulse rounded" /></div>

  if (notFound) return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/produtos')}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold tracking-tight">Produto nao encontrado</h1></div>
      </div>
      <Button onClick={() => router.push('/produtos')}>Voltar</Button>
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/produtos')}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold tracking-tight">Editar Produto</h1><p className="text-muted-foreground">Atualize os dados do produto</p></div>
        </div>
        <Button variant="destructive" onClick={() => setDeleteModal(true)}><Trash2 className="mr-2 h-4 w-4" />Excluir</Button>
      </div>
      <div className="rounded-xl border p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Codigo *" value={form.code} onChange={(e) => updateField('code', e.target.value)} placeholder="Ex: PROD-001" error={errors.code} />
          <Input label="Nome *" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Nome do produto" error={errors.name} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Marca *" value={form.brand} onChange={(e) => updateField('brand', e.target.value)} placeholder="Marca do produto" error={errors.brand} />
          <Select label="Categoria *" options={categoryOptions} value={form.category} onChange={(e) => updateField('category', e.target.value)} error={errors.category} />
        </div>
        <Input label="Descricao" value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Descricao opcional" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Preco de Custo" type="number" step="0.01" min="0" value={form.costPrice} onChange={(e) => updateField('costPrice', e.target.value)} placeholder="0.00" />
          <Input label="Preco de Venda *" type="number" step="0.01" min="0" value={form.sellPrice} onChange={(e) => updateField('sellPrice', e.target.value)} placeholder="0.00" error={errors.sellPrice} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Estoque Minimo" type="number" min="0" value={form.minStock} onChange={(e) => updateField('minStock', e.target.value)} placeholder="5" />
          <Input label="Estoque Atual" type="number" min="0" value={form.currentStock} onChange={(e) => updateField('currentStock', e.target.value)} placeholder="0" />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push('/produtos')}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? 'Salvando...' : 'Salvar'}</Button>
      </div>
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)}>
        <ModalContent>
          <ModalHeader><ModalTitle>Excluir Produto</ModalTitle><ModalDescription>Tem certeza? Esta acao nao pode ser desfeita.</ModalDescription></ModalHeader>
          <ModalFooter><Button variant="outline" onClick={() => setDeleteModal(false)}>Cancelar</Button><Button variant="destructive" onClick={handleDelete}>Excluir</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default function EditProdutoPage() {
  return <Suspense fallback={<div className="max-w-2xl p-6"><div className="h-8 w-48 bg-muted animate-pulse rounded" /></div>}><EditProdutoForm /></Suspense>
}
