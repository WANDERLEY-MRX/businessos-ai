'use client'
import { useState, useEffect } from 'react'
import { useSettings } from '@/lib/settings-context'

export function StoreInfo() {
  const { settings, updateSettings } = useSettings()
  const [name, setName] = useState('')
  const [logo, setLogo] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [city, setCity] = useState('')
  const [stateVal, setStateVal] = useState('')
  const [hours, setHours] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings?.store) {
      setName(settings.store.name || '')
      setLogo(settings.store.logo || '')
      setAddress(settings.store.address || '')
      setPhone(settings.store.phone || '')
      setCnpj(settings.store.cnpj || '')
      setCity(settings.store.city || '')
      setStateVal(settings.store.state || '')
      setHours(settings.store.hours || '')
    }
  }, [settings])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    updateSettings({
      store: { name, logo, address, phone, cnpj, city, state: stateVal, hours },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Dados da Loja</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Nome da Loja</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Logo</label>
        <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full px-3 py-2 border rounded-lg" />
        {logo && <img src={logo} alt="Logo" className="mt-2 h-16 w-16 object-contain" />}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Endereço</label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Telefone</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CNPJ</label>
          <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cidade</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <input type="text" value={stateVal} onChange={(e) => setStateVal(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Horário</label>
        <input type="text" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Seg-Sex 9h-18h" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>
      <button onClick={handleSave} className="w-full bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 font-medium">Salvar</button>
      {saved && <p className="text-sm text-emerald-600 text-center font-medium">Salvo com sucesso!</p>}
    </div>
  )
}
