'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSettings } from '@/lib/settings-context'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: '📊', href: '/dashboard' },
  { label: 'Produtos', icon: '📦', href: '/produtos' },
  { label: 'Clientes', icon: '👤', href: '/clientes' },
  { label: 'PDV', icon: '🛒', href: '/pdv' },
  { label: 'Ordens de Serviço', icon: '🔧', href: '/ordens-de-servico' },
  { label: 'Financeiro', icon: '💰', href: '/financeiro' },
  { label: 'Config', icon: '⚙️', href: '/config' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { settings } = useSettings()
  const [collapsed, setCollapsed] = useState(false)

  const storeName = settings?.store?.name || 'BusinessOS'

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-2 font-semibold',
              collapsed && 'justify-center'
            )}
            onClick={onClose}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-bold">
              B
            </div>
            {!collapsed && (
              <span className="text-sm font-bold truncate">{storeName}</span>
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    active && 'bg-accent text-accent-foreground',
                    collapsed && 'justify-center'
                  )}
                >
                  <span className="text-lg shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </aside>
    </>
  )
}
