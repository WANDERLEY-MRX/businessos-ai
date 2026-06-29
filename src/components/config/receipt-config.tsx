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

export function ReceiptConfig() {
  const { settings, updateSettings } = useSettings()
  const [showLogo, setShowLogo] = useState(true)
  const [showCNPJ, setShowCNPJ] = useState(true)
  const [showAddress, setShowAddress] = useState(true)
  const [thankYouMessage, setThankYouMessage] = useState('')
  const [terms, setTerms] = useState('')
  const [footerText, setFooterText] = useState('')
  const [format, setFormat] = useState<'simple' | 'detailed'>('simple')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings?.receipt) {
      setShowLogo(settings.receipt.showLogo ?? true)
      setShowCNPJ(settings.receipt.showCNPJ ?? true)
      setShowAddress(settings.receipt.showAddress ?? true)
      setThankYouMessage(settings.receipt.thankYouMessage || '')
      setTerms(settings.receipt.terms || '')
      setFooterText(settings.receipt.footerText || '')
      setFormat(settings.receipt.format || 'simple')
    }
  }, [settings])

  const handleSave = () => {
    updateSettings({
      receipt: { showLogo, showCNPJ, showAddress, thankYouMessage, terms, footerText, format },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Configuração do Cupom</h2>
      <div className="space-y-3">
        <ToggleSwitch label="Mostrar Logo" checked={showLogo} onChange={setShowLogo} />
        <ToggleSwitch label="Mostrar CNPJ" checked={showCNPJ} onChange={setShowCNPJ} />
        <ToggleSwitch label="Mostrar Endereço" checked={showAddress} onChange={setShowAddress} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Formato</label>
        <select value={format} onChange={(e) => setFormat(e.target.value as 'simple' | 'detailed')} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="simple">Simples</option>
          <option value="detailed">Detalhado</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Mensagem de Agradecimento</label>
        <textarea value={thankYouMessage} onChange={(e) => setThankYouMessage(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Termos</label>
        <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Rodapé</label>
        <textarea value={footerText} onChange={(e) => setFooterText(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>
      <button onClick={handleSave} className="w-full bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 font-medium">Salvar</button>
      {saved && <p className="text-sm text-emerald-600 text-center font-medium">Salvo com sucesso!</p>}
    </div>
  )
}
