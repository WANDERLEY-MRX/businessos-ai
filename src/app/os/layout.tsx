'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function OSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout title="Ordens de Serviço">{children}</DashboardLayout>
}
