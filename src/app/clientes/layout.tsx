'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function ClientesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout title="Clientes">{children}</DashboardLayout>
}
