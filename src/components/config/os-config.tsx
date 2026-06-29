'use client'
import { useState, useEffect } from 'react'
import { useSettings } from '@/lib/settings-context'

function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-violet-600' : 'bg-gray-300'}`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </div>
      </div>
    </label>
  )
}

export function OsConfig() {
  const { settings, updateSettings } = useSettings()
  const [showLogo, setShowLogo] = useState(true)
  const [showFiscalData, setShowFiscalData] = useState(true)
  const [autoNumber, setAutoNumber] = useState(true)
  const [validityDays, setValidityDays] = useState(30)
  const [defaultMessage, setDefaultMessage] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings?.os) {
      setShowLogo(settings.os.showLogo ?? true)
      setShowFiscalData(settings.os.showFiscalData ?? true)
      setAutoNumber(settings.os.autoNumber ?? true)
      setValidityDays(settings.os.validityDays ?? 30)
      setDefaultMessage(settings.os.defaultMessage || '')
    }
  }, [settings])

  const handleSave = () => {
    updateSettings({
      os: { showLogo, showFiscalData, autoNumber, validityDays, defaultMessage },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Configuração da OS</h2>
      <div className="space-y-3">
        <ToggleSwitch label="Mostrar Logo" checked={showLogo} onChange={setShowLogo} />
        <ToggleSwitch label="Mostrar Dados Fiscais" checked={showFiscalData} onChange={setShowFiscalData} />
        <ToggleSwitch label="Numeração Automática" checked={autoNumber} onChange={setAutoNumber} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Validade (dias)</label>
        <input type="number" value={validityDays} onChange={(e) => setValidityDays(Number(e.target.value))} min={1} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Mensagem Padrão</label>
        <textarea value={defaultMessage} onChange={(e) => setDefaultMessage(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>
      <button onClick={handleSave} className="w-full bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 font-medium">Salvar</button>
      {saved && <p className="text-sm text-emerald-600 text-center font-medium">Salvo com sucesso!</p>}
    </div>
  )
}
