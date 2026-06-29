'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function PDVLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout title="PDV - Ponto de Venda">{children}</DashboardLayout>
}
