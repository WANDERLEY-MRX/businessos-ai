'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createCustomer } from '@/lib/store'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function NovoClientePage() {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    notes: '',
  })

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

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!form.cpf.trim()) newErrors.cpf = 'CPF é obrigatório'
    if (!form.phone.trim()) newErrors.phone = 'Telefone é obrigatório'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    createCustomer({
      name: form.name.trim(),
      cpf: form.cpf.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      notes: form.notes.trim() || undefined,
    })
    router.push('/clientes')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Cliente</h1>
          <p className="text-muted-foreground">Adicione um novo cliente ao sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nome *"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                placeholder="Nome completo"
              />
              <Input
                label="CPF *"
                value={form.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                error={errors.cpf}
                placeholder="000.000.000-00"
              />
              <Input
                label="Telefone *"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={errors.phone}
                placeholder="(00) 00000-0000"
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <Input
              label="Endereço"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Rua, número, complemento"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Cidade"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Cidade"
              />
              <Input
                label="Estado"
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="UF"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Observações
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Observações sobre o cliente..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Link href="/clientes">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
