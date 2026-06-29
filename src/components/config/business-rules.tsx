'use client'
import { useState, useEffect } from 'react'
import { useSettings } from '@/lib/settings-context'
import { PaymentMethod } from '@/lib/types'

export function BusinessRules() {
  const { settings, updateSettings } = useSettings()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [allowCredit, setAllowCredit] = useState(false)
  const [requireCPF, setRequireCPF] = useState(false)
  const [printAfterSale, setPrintAfterSale] = useState(true)
  const [creditLimit, setCreditLimit] = useState(0)
  const [saved, setSaved] = useState(false)

  const availableMethods: PaymentMethod[] = ['dinheiro', 'credito', 'debito', 'pix', 'fiado']

  useEffect(() => {
    if (settings) {
      setPaymentMethods(settings.rules?.paymentMethods || [])
      setAllowCredit(settings.rules?.allowCredit ?? false)
      setRequireCPF(settings.rules?.requireCPF ?? false)
      setPrintAfterSale(settings.rules?.printAfterSale ?? true)
      setCreditLimit(settings.rules?.creditLimit ?? 0)
    }
  }, [settings])

  const toggleMethod = (method: PaymentMethod) => {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    )
  }

  const handleSave = () => {
    updateSettings({
      rules: {
        paymentMethods,
        allowCredit,
        requireCPF,
        printAfterSale,
        creditLimit,
      },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Regras de Negócio</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Formas de Pagamento</label>
        <div className="space-y-2">
          {availableMethods.map((method) => (
            <label key={method} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={paymentMethods.includes(method)}
                onChange={() => toggleMethod(method)}
                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700 capitalize">{method}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <ToggleSwitch
          label="Permitir Crédito"
          checked={allowCredit}
          onChange={setAllowCredit}
        />
        <ToggleSwitch
          label="Exigir CPF"
          checked={requireCPF}
          onChange={setRequireCPF}
        />
        <ToggleSwitch
          label="Imprimir após Venda"
          checked={printAfterSale}
          onChange={setPrintAfterSale}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Crédito (R$)</label>
        <input
          type="number"
          value={creditLimit}
          onChange={(e) => setCreditLimit(Number(e.target.value))}
          min={0}
          step={0.01}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 transition-colors font-medium"
      >
        Salvar
      </button>

      {saved && (
        <p className="text-sm text-emerald-600 text-center font-medium">Salvo com sucesso!</p>
      )}
    </div>
  )
}

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-violet-600' : 'bg-gray-300'}`}>
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`}
          />
        </div>
      </div>
    </label>
  )
}
