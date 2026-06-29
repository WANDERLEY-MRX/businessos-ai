'use client'
import { ReactNode } from 'react'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  color?: 'default' | 'success' | 'warning' | 'danger'
}

export function KpiCard({ title, value, subtitle, icon, color = 'default' }: KpiCardProps) {
  const colorStyles = {
    default: 'bg-violet-100 text-violet-600',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-red-100 text-red-600',
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${colorStyles[color]}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
