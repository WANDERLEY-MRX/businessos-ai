'use client'

import { useEffect, useState, ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { initializeStore } from '@/lib/store'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    initializeStore()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 transition-all duration-300">
        <Header
          title={title}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
