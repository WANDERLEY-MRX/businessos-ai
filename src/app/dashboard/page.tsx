'use client'

import { useState, useEffect } from 'react'
import { getDashboardKPIs } from '@/lib/store'
import { formatCurrency, formatDate, getOSStatusLabel, getPaymentMethodLabel } from '@/lib/utils'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { Chart } from '@/components/dashboard/chart'

export default function DashboardPage() {
  const [kpis, setKpis] = useState<{
    todaySales: number
    todayRevenue: number
    monthRevenue: number
    lowStockCount: number
    openOSCount: number
    recentSales: any[]
    recentOS: any[]
    salesLast7Days: { date: string; total: number }[]
  } | null>(null)

  useEffect(() => {
    setKpis(getDashboardKPIs())
  }, [])

  if (!kpis) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </div>
    )
  }

  const chartData = kpis.salesLast7Days.map((d) => ({
    label: formatDate(d.date),
    value: d.total,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Vendas Hoje"
          value={kpis.todaySales}
          subtitle={formatCurrency(kpis.todayRevenue)}
          color="success"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <KpiCard
          title="Receita Mês"
          value={formatCurrency(kpis.monthRevenue)}
          color="default"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          title="Estoque Baixo"
          value={kpis.lowStockCount}
          subtitle="produtos abaixo do mínimo"
          color={kpis.lowStockCount > 0 ? 'danger' : 'success'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <KpiCard
          title="OS Abertas"
          value={kpis.openOSCount}
          subtitle="ordens de serviço pendentes"
          color={kpis.openOSCount > 0 ? 'warning' : 'success'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
      </div>

      <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendas - Últimos 7 Dias</h2>
        <Chart data={chartData} height={250} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Últimas Vendas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Nº</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kpis.recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                      Nenhuma venda registrada
                    </td>
                  </tr>
                ) : (
                  kpis.recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">#{sale.number}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{sale.customerName || 'Consumidor Final'}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-900">{formatCurrency(sale.total)}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{getPaymentMethodLabel(sale.paymentMethod)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Últimas OS</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Nº</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Equipamento</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kpis.recentOS.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                      Nenhuma OS registrada
                    </td>
                  </tr>
                ) : (
                  kpis.recentOS.map((os) => (
                    <tr key={os.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">#{os.number}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{os.customerName || '—'}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{os.equipment} {os.brand} {os.model}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                          {getOSStatusLabel(os.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
