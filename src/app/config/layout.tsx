'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function ConfigLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout title="Configurações">{children}</DashboardLayout>
}
