'use client'

import { useState, useEffect } from 'react'
import {
  getTransactions,
  createTransaction,
  getBalance,
  getTransactionsByPeriod,
} from '@/lib/store'
import {
  formatCurrency,
  formatDate,
  getExpenseCategoryLabel,
  getPaymentMethodLabel,
} from '@/lib/utils'
import { FinancialTransaction, ExpenseCategory, PaymentMethod } from '@/lib/types'

const PERIOD_OPTIONS = [
  { label: 'Hoje', value: 'today' },
  { label: 'Esta Semana', value: 'week' },
  { label: 'Este Mês', value: 'month' },
  { label: 'Este Ano', value: 'year' },
  { label: 'Personalizado', value: 'custom' },
]

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'aluguel',
  'energia',
  'agua',
  'fornecedor',
  'salario',
  'transporte',
  'marketing',
  'manutencao',
  'outros',
]

const PAYMENT_METHODS: PaymentMethod[] = [
  'dinheiro',
  'credito',
  'debito',
  'pix',
  'fiado',
]

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [period, setPeriod] = useState('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'fornecedor' as ExpenseCategory,
    type: 'saida' as 'entrada' | 'saida',
    paymentMethod: 'pix' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadTransactions()
  }, [period, customStart, customEnd])

  function loadTransactions() {
    let data: FinancialTransaction[]
    if (period === 'custom' && customStart && customEnd) {
      data = getTransactionsByPeriod(customStart, customEnd)
    } else {
      data = getTransactionsByPeriod(
        getStartDate(period),
        new Date().toISOString().split('T')[0]
      )
    }
    setTransactions(data)
  }

  function getStartDate(period: string): string {
    const now = new Date()
    switch (period) {
      case 'today':
        return now.toISOString().split('T')[0]
      case 'week': {
        const day = now.getDay()
        const diff = now.getDate() - day + (day === 0 ? -6 : 1)
        const d = new Date(now.getFullYear(), now.getMonth(), diff)
        return d.toISOString().split('T')[0]
      }
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      case 'year':
        return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    }
  }

  const balance = getBalance()
  const totalEntradas = transactions
    .filter((t) => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalSaidas = transactions
    .filter((t) => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0)
  const saldoPeriodo = totalEntradas - totalSaidas

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description || !form.amount) return
    createTransaction({
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.type === 'saida' ? form.category : 'outros',
      type: form.type,
      paymentMethod: form.paymentMethod,
      date: form.date || new Date().toISOString().split('T')[0],
    })
    setForm({
      description: '',
      amount: '',
      category: 'fornecedor',
      type: 'saida',
      paymentMethod: 'pix',
      date: new Date().toISOString().split('T')[0],
    })
    setShowModal(false)
    loadTransactions()
  }

  function getDailyChartData() {
    const days: { date: string; entradas: number; saidas: number }[] = []
    const map = new Map<string, { entradas: number; saidas: number }>()

    transactions.forEach((t) => {
      const key = t.date
      const existing = map.get(key) || { entradas: 0, saidas: 0 }
      if (t.type === 'entrada') {
        existing.entradas += t.amount
      } else {
        existing.saidas += t.amount
      }
      map.set(key, existing)
    })

    map.forEach((value, key) => {
      days.push({ date: key, ...value })
    })

    days.sort((a, b) => a.date.localeCompare(b.date))
    return days.slice(-10)
  }

  const chartData = getDailyChartData()
  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d.entradas, d.saidas)),
    1
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Entradas</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalEntradas)}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Saídas</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalSaidas)}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Saldo</p>
          <p
            className={`text-2xl font-bold ${
              saldoPeriodo >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(saldoPeriodo)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-medium mb-3">Entradas vs Saídas por Dia</h3>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sem dados para exibir
          </p>
        ) : (
          <div className="flex items-end gap-2 h-48">
            {chartData.map((d) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div className="flex gap-0.5 items-end h-40">
                  <div
                    className="w-3 bg-green-500 rounded-t"
                    style={{
                      height: `${(d.entradas / maxValue) * 100}%`,
                      minHeight: d.entradas > 0 ? '2px' : '0',
                    }}
                  />
                  <div
                    className="w-3 bg-red-500 rounded-t"
                    style={{
                      height: `${(d.saidas / maxValue) * 100}%`,
                      minHeight: d.saidas > 0 ? '2px' : '0',
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {d.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-xs text-muted-foreground">Entradas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-xs text-muted-foreground">Saídas</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  period === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            Adicionar Despesa
          </button>
        </div>

        {period === 'custom' && (
          <div className="flex gap-4 mb-4">
            <div>
              <label className="text-sm text-muted-foreground">De</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Até</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Data</th>
                <th className="pb-2 font-medium">Descrição</th>
                <th className="pb-2 font-medium">Categoria</th>
                <th className="pb-2 font-medium">Tipo</th>
                <th className="pb-2 font-medium text-right">Valor</th>
                <th className="pb-2 font-medium">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Nenhuma transação encontrada
                  </td>
                </tr>
              ) : (
                transactions
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((t) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-3">{formatDate(t.date)}</td>
                      <td className="py-3">{t.description}</td>
                      <td className="py-3">
                        {t.category ? getExpenseCategoryLabel(t.category) : '-'}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            t.type === 'entrada'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {t.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td
                        className={`py-3 text-right font-medium ${
                          t.type === 'entrada'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {t.type === 'entrada' ? '+' : '-'}{' '}
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="py-3">
                        {t.paymentMethod ? getPaymentMethodLabel(t.paymentMethod) : '-'}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {form.type === 'entrada' ? 'Adicionar Entrada' : 'Adicionar Despesa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'saida' })}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    form.type === 'saida'
                      ? 'bg-red-600 text-white'
                      : 'bg-secondary'
                  }`}
                >
                  Saída
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'entrada' })}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    form.type === 'entrada'
                      ? 'bg-green-600 text-white'
                      : 'bg-secondary'
                  }`}
                >
                  Entrada
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              {form.type === 'saida' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Categoria
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as ExpenseCategory,
                      })
                    }
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {getExpenseCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentMethod: e.target.value as PaymentMethod,
                    })
                  }
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {getPaymentMethodLabel(pm)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-md text-sm font-medium bg-secondary hover:bg-secondary/80"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
