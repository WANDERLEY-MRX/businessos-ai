import { Product, Customer, Sale, ServiceOrder, FinancialTransaction, StoreSettings, OSStatus, PaymentMethod } from './types'

const STORAGE_KEYS = {
  products: 'businessos_products',
  customers: 'businessos_customers',
  sales: 'businessos_sales',
  serviceOrders: 'businessos_service_orders',
  financial: 'businessos_financial',
  settings: 'businessos_settings',
  counters: 'businessos_counters',
}

function getStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(key)
  if (!data) return []
  try {
    return JSON.parse(data) as T[]
  } catch {
    return []
  }
}

function setStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function getCounter(name: string): number {
  if (typeof window === 'undefined') return 1
  const data = localStorage.getItem(STORAGE_KEYS.counters)
  let counters: Record<string, number> = {}
  try { counters = data ? JSON.parse(data) : {} } catch { counters = {} }
  return (counters[name] || 0) + 1
}

function setCounter(name: string, value: number): void {
  if (typeof window === 'undefined') return
  const data = localStorage.getItem(STORAGE_KEYS.counters)
  let counters: Record<string, number> = {}
  try { counters = data ? JSON.parse(data) : {} } catch { counters = {} }
  counters[name] = value
  localStorage.setItem(STORAGE_KEYS.counters, JSON.stringify(counters))
}

function getSettingsStorage(): StoreSettings {
  if (typeof window === 'undefined') return {} as StoreSettings
  const data = localStorage.getItem(STORAGE_KEYS.settings)
  if (!data) return {} as StoreSettings
  try {
    return JSON.parse(data) as StoreSettings
  } catch {
    return {} as StoreSettings
  }
}

function setSettingsStorage(data: StoreSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data))
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getMonthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
}

export function getProducts(): Product[] {
  return getStorage<Product>(STORAGE_KEYS.products)
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id)
}

export function getProductByCode(code: string): Product | undefined {
  return getProducts().find((p) => p.code === code)
}

export function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const products = getProducts()
  const now = new Date().toISOString()
  const product: Product = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  products.push(product)
  setStorage(STORAGE_KEYS.products, products)
  return product
}

export function updateProduct(id: string, data: Partial<Product>): Product {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) throw new Error('Product not found')
  const updated: Product = {
    ...products[index],
    ...data,
    id: products[index].id,
    createdAt: products[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  products[index] = updated
  setStorage(STORAGE_KEYS.products, products)
  return updated
}

export function deleteProduct(id: string): void {
  const products = getProducts()
  const filtered = products.filter((p) => p.id !== id)
  setStorage(STORAGE_KEYS.products, filtered)
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase()
  return getProducts().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  )
}

export function getLowStockProducts(): Product[] {
  return getProducts().filter((p) => p.currentStock <= p.minStock)
}

export function getCustomers(): Customer[] {
  return getStorage<Customer>(STORAGE_KEYS.customers)
}

export function getCustomer(id: string): Customer | undefined {
  return getCustomers().find((c) => c.id === id)
}

export function getCustomerByCPF(cpf: string): Customer | undefined {
  return getCustomers().find((c) => c.cpf === cpf)
}

export function createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
  const customers = getCustomers()
  const now = new Date().toISOString()
  const customer: Customer = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  customers.push(customer)
  setStorage(STORAGE_KEYS.customers, customers)
  return customer
}

export function updateCustomer(id: string, data: Partial<Customer>): Customer {
  const customers = getCustomers()
  const index = customers.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Customer not found')
  const updated: Customer = {
    ...customers[index],
    ...data,
    id: customers[index].id,
    createdAt: customers[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  customers[index] = updated
  setStorage(STORAGE_KEYS.customers, customers)
  return updated
}

export function deleteCustomer(id: string): void {
  const customers = getCustomers()
  const filtered = customers.filter((c) => c.id !== id)
  setStorage(STORAGE_KEYS.customers, filtered)
}

export function searchCustomers(query: string): Customer[] {
  const q = query.toLowerCase()
  return getCustomers().filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.cpf.includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
  )
}

export function getSales(): Sale[] {
  return getStorage<Sale>(STORAGE_KEYS.sales)
}

export function getSale(id: string): Sale | undefined {
  return getSales().find((s) => s.id === id)
}

export function createSale(data: Omit<Sale, 'id' | 'number' | 'createdAt'>): Sale {
  const sales = getSales()
  const number = getNextSaleNumber()
  const sale: Sale = {
    ...data,
    id: generateId(),
    number,
    createdAt: new Date().toISOString(),
  }
  sales.push(sale)
  setStorage(STORAGE_KEYS.sales, sales)

  if (data.status === 'concluida') {
    const products = getProducts()
    for (const item of data.items) {
      const productIndex = products.findIndex((p) => p.id === item.productId)
      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          currentStock: products[productIndex].currentStock - item.quantity,
          updatedAt: new Date().toISOString(),
        }
      }
    }
    setStorage(STORAGE_KEYS.products, products)

    createTransaction({
      type: 'entrada',
      description: `Venda #${number}${data.customerName ? ` - ${data.customerName}` : ''}`,
      amount: data.total,
      paymentMethod: data.paymentMethod,
      referenceId: sale.id,
      date: getToday(),
    })
  }

  return sale
}

export function cancelSale(id: string): void {
  const sales = getSales()
  const index = sales.findIndex((s) => s.id === id)
  if (index === -1) throw new Error('Sale not found')
  const sale = sales[index]
  if (sale.status === 'cancelada') return

  sales[index] = { ...sale, status: 'cancelada' }
  setStorage(STORAGE_KEYS.sales, sales)

  if (sale.status === 'concluida') {
    const products = getProducts()
    for (const item of sale.items) {
      const productIndex = products.findIndex((p) => p.id === item.productId)
      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          currentStock: products[productIndex].currentStock + item.quantity,
          updatedAt: new Date().toISOString(),
        }
      }
    }
    setStorage(STORAGE_KEYS.products, products)

    createTransaction({
      type: 'saida',
      description: `Cancelamento venda #${sale.number}`,
      amount: sale.total,
      paymentMethod: sale.paymentMethod,
      referenceId: sale.id,
      date: getToday(),
    })
  }
}

export function getSalesByCustomer(customerId: string): Sale[] {
  return getSales().filter((s) => s.customerId === customerId)
}

export function getSalesByDate(date: string): Sale[] {
  return getSales().filter((s) => s.createdAt.startsWith(date))
}

export function getSalesByPeriod(start: string, end: string): Sale[] {
  return getSales().filter((s) => {
    const saleDate = s.createdAt.split('T')[0]
    return saleDate >= start && saleDate <= end
  })
}

export function getServiceOrders(): ServiceOrder[] {
  return getStorage<ServiceOrder>(STORAGE_KEYS.serviceOrders)
}

export function getServiceOrder(id: string): ServiceOrder | undefined {
  return getServiceOrders().find((o) => o.id === id)
}

export function createServiceOrder(data: Omit<ServiceOrder, 'id' | 'number' | 'createdAt' | 'updatedAt' | 'statusHistory'>): ServiceOrder {
  const orders = getServiceOrders()
  const number = getNextOSNumber()
  const now = new Date().toISOString()
  const order: ServiceOrder = {
    ...data,
    id: generateId(),
    number,
    createdAt: now,
    updatedAt: now,
    statusHistory: [
      {
        status: data.status,
        date: now,
        note: 'Ordem de serviço criada',
      },
    ],
  }
  orders.push(order)
  setStorage(STORAGE_KEYS.serviceOrders, orders)
  return order
}

export function updateServiceOrder(id: string, data: Partial<ServiceOrder>): ServiceOrder {
  const orders = getServiceOrders()
  const index = orders.findIndex((o) => o.id === id)
  if (index === -1) throw new Error('Service order not found')
  const { status: _status, statusHistory: _history, ...safeData } = data
  const updated: ServiceOrder = {
    ...orders[index],
    ...safeData,
    id: orders[index].id,
    number: orders[index].number,
    createdAt: orders[index].createdAt,
    updatedAt: new Date().toISOString(),
    statusHistory: orders[index].statusHistory,
  }
  orders[index] = updated
  setStorage(STORAGE_KEYS.serviceOrders, orders)
  return updated
}

const VALID_TRANSITIONS: Record<OSStatus, OSStatus[]> = {
  aberto: ['em_andamento'],
  em_andamento: ['aguardando_peca', 'concluido'],
  aguardando_peca: ['em_andamento', 'concluido'],
  concluido: ['entregue'],
  entregue: [],
}

export function updateOSStatus(id: string, status: OSStatus, note?: string): ServiceOrder {
  const orders = getServiceOrders()
  const index = orders.findIndex((o) => o.id === id)
  if (index === -1) throw new Error('Service order not found')
  const order = orders[index]
  if (!VALID_TRANSITIONS[order.status]?.includes(status)) {
    throw new Error(`Transicao invalida: ${order.status} -> ${status}`)
  }
  const now = new Date().toISOString()
  const updated: ServiceOrder = {
    ...order,
    status,
    updatedAt: now,
    statusHistory: [
      ...order.statusHistory,
      { status, date: now, note },
    ],
  }
  orders[index] = updated
  setStorage(STORAGE_KEYS.serviceOrders, orders)
  return updated
}

export function deleteServiceOrder(id: string): void {
  const orders = getServiceOrders()
  const filtered = orders.filter((o) => o.id !== id)
  setStorage(STORAGE_KEYS.serviceOrders, filtered)
}

export function getOSByCustomer(customerId: string): ServiceOrder[] {
  return getServiceOrders().filter((o) => o.customerId === customerId)
}

export function getOpenOSCount(): number {
  return getServiceOrders().filter((o) => o.status !== 'concluido' && o.status !== 'entregue').length
}

export function getTransactions(): FinancialTransaction[] {
  return getStorage<FinancialTransaction>(STORAGE_KEYS.financial)
}

export function getTransaction(id: string): FinancialTransaction | undefined {
  return getTransactions().find((t) => t.id === id)
}

export function createTransaction(data: Omit<FinancialTransaction, 'id' | 'createdAt'>): FinancialTransaction {
  const transactions = getTransactions()
  const transaction: FinancialTransaction = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  transactions.push(transaction)
  setStorage(STORAGE_KEYS.financial, transactions)
  return transaction
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions()
  const filtered = transactions.filter((t) => t.id !== id)
  setStorage(STORAGE_KEYS.financial, filtered)
}

export function getTransactionsByPeriod(start: string, end: string): FinancialTransaction[] {
  return getTransactions().filter((t) => t.date >= start && t.date <= end)
}

export function getBalance(): { entries: number; exits: number; balance: number } {
  const transactions = getTransactions()
  const entries = transactions.filter((t) => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0)
  const exits = transactions.filter((t) => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0)
  return { entries, exits, balance: entries - exits }
}

export function getSettings(): StoreSettings {
  return getSettingsStorage()
}

export function updateSettings(data: Partial<StoreSettings>): StoreSettings {
  const current = getSettings()
  const updated: StoreSettings = {
    ...current,
    ...data,
    store: { ...current.store, ...data.store },
    receipt: { ...current.receipt, ...data.receipt },
    os: { ...current.os, ...data.os },
    rules: { ...current.rules, ...data.rules },
    print: { ...current.print, ...data.print },
  }
  setSettingsStorage(updated)
  return updated
}

export function getNextSaleNumber(): string {
  const num = getCounter('sale')
  setCounter('sale', num)
  return num.toString().padStart(6, '0')
}

export function getNextOSNumber(): string {
  const num = getCounter('os')
  setCounter('os', num)
  return num.toString().padStart(6, '0')
}

export function getDashboardKPIs(): {
  todaySales: number
  todayRevenue: number
  monthRevenue: number
  lowStockCount: number
  openOSCount: number
  recentSales: Sale[]
  recentOS: ServiceOrder[]
  salesLast7Days: { date: string; total: number }[]
} {
  const today = getToday()
  const monthStart = getMonthStart()
  const sales = getSales().filter((s) => s.status === 'concluida')
  const todaySales = sales.filter((s) => s.createdAt.startsWith(today))
  const monthSales = sales.filter((s) => {
    const saleDate = s.createdAt.split('T')[0]
    return saleDate >= monthStart && saleDate <= today
  })

  const last7Days: { date: string; total: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayTotal = sales
      .filter((s) => s.createdAt.startsWith(dateStr))
      .reduce((sum, s) => sum + s.total, 0)
    last7Days.push({ date: dateStr, total: dayTotal })
  }

  return {
    todaySales: todaySales.length,
    todayRevenue: todaySales.reduce((sum, s) => sum + s.total, 0),
    monthRevenue: monthSales.reduce((sum, s) => sum + s.total, 0),
    lowStockCount: getLowStockProducts().length,
    openOSCount: getOpenOSCount(),
    recentSales: getSales().slice(-5).reverse(),
    recentOS: getServiceOrders().slice(-5).reverse(),
    salesLast7Days: last7Days,
  }
}

export function initializeStore(): void {
  if (typeof window === 'undefined') return
  const products = getProducts()
  if (products.length === 0) {
    import('../data/seed').then(({ seedProducts, seedCustomers, seedSales, seedServiceOrders, seedTransactions, defaultSettings }) => {
      const now = new Date().toISOString()

      const productsData: Product[] = seedProducts.map((p) => ({
        ...p,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }))
      setStorage(STORAGE_KEYS.products, productsData)

      const customersData: Customer[] = seedCustomers.map((c) => ({
        ...c,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }))
      setStorage(STORAGE_KEYS.customers, customersData)

      const salesData: Sale[] = seedSales.map((s, i) => ({
        ...s,
        id: generateId(),
        number: (i + 1).toString().padStart(6, '0'),
        customerId: customersData[i]?.id || '',
        items: s.items.map((item, j) => ({
          ...item,
          productId: productsData[j]?.id || '',
        })),
        createdAt: now,
      }))
      setStorage(STORAGE_KEYS.sales, salesData)

      const osData: ServiceOrder[] = seedServiceOrders.map((o, i) => ({
        ...o,
        id: generateId(),
        number: (i + 1).toString().padStart(6, '0'),
        customerId: customersData[0]?.id || '',
        createdAt: now,
        updatedAt: now,
        statusHistory: [
          { status: o.status, date: now, note: 'Ordem de serviço criada' },
        ],
      }))
      setStorage(STORAGE_KEYS.serviceOrders, osData)

      const txData: FinancialTransaction[] = seedTransactions.map((t) => ({
        ...t,
        id: generateId(),
        createdAt: now,
      }))
      setStorage(STORAGE_KEYS.financial, txData)

      setSettingsStorage(defaultSettings)

      const counters = { sale: seedSales.length, os: seedServiceOrders.length }
      localStorage.setItem(STORAGE_KEYS.counters, JSON.stringify(counters))
    })
  }
}
