'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { StoreSettings } from './types'
import { getSettings, updateSettings as storeUpdate } from './store'

interface SettingsContextType {
  settings: StoreSettings
  updateSettings: (data: Partial<StoreSettings>) => void
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const defaultSettings: StoreSettings = {
  store: { name: '', logo: '', address: '', phone: '', cnpj: '', city: '', state: '', hours: '' },
  receipt: { showLogo: true, showCNPJ: true, showAddress: true, thankYouMessage: '', terms: '', footerText: '', format: 'simple' },
  os: { showLogo: true, showFiscalData: true, defaultMessage: '', validityDays: 30, autoNumber: true },
  rules: { paymentMethods: ['dinheiro', 'credito', 'debito', 'pix', 'fiado'], allowCredit: true, creditLimit: 1000, requireCPF: false, printAfterSale: true },
  print: { paperWidth: '80mm', fontSize: 'medium', showBarcode: false, showQRCode: false, copies: 1 },
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loaded = getSettings()
    setSettings(loaded)
    setIsLoading(false)
  }, [])

  const handleUpdateSettings = (data: Partial<StoreSettings>) => {
    const updated = storeUpdate(data)
    setSettings(updated)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings: handleUpdateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}
