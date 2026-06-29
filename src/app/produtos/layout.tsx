'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function ProdutosLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout title="Produtos">{children}</DashboardLayout>
}
