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

export function PrintConfig() {
  const { settings, updateSettings } = useSettings()
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm' | 'A4'>('80mm')
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [showBarcode, setShowBarcode] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [copies, setCopies] = useState(1)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings?.print) {
      setPaperWidth(settings.print.paperWidth || '80mm')
      setFontSize(settings.print.fontSize || 'medium')
      setShowBarcode(settings.print.showBarcode ?? false)
      setShowQRCode(settings.print.showQRCode ?? false)
      setCopies(settings.print.copies ?? 1)
    }
  }, [settings])

  const handleSave = () => {
    updateSettings({
      print: { paperWidth, fontSize, showBarcode, showQRCode, copies },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Configuração de Impressão</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Largura do Papel</label>
        <select value={paperWidth} onChange={(e) => setPaperWidth(e.target.value as '58mm' | '80mm' | 'A4')} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="58mm">58mm</option>
          <option value="80mm">80mm</option>
          <option value="A4">A4</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tamanho da Fonte</label>
        <select value={fontSize} onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="small">Pequena</option>
          <option value="medium">Média</option>
          <option value="large">Grande</option>
        </select>
      </div>
      <div className="space-y-3">
        <ToggleSwitch label="Código de Barras" checked={showBarcode} onChange={setShowBarcode} />
        <ToggleSwitch label="QR Code" checked={showQRCode} onChange={setShowQRCode} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Cópias</label>
        <input type="number" value={copies} onChange={(e) => setCopies(Number(e.target.value))} min={1} max={10} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>
      <button onClick={handleSave} className="w-full bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 font-medium">Salvar</button>
      {saved && <p className="text-sm text-emerald-600 text-center font-medium">Salvo com sucesso!</p>}
    </div>
  )
}
