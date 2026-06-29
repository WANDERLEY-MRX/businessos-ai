'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function FinanceiroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout title="Financeiro">{children}</DashboardLayout>
}
