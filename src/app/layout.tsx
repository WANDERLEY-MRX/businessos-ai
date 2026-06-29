import type { Metadata } from 'next'
import './globals.css'
import { SettingsProvider } from '@/lib/settings-context'

export const metadata: Metadata = {
  title: 'BusinessOS AI',
  description: 'Sistema de gestão para lojas de eletrônicos',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background font-sans antialiased">
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  )
}
