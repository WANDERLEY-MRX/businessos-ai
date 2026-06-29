export interface Product {
  id: string
  code: string
  name: string
  brand: string
  category: string
  description?: string
  costPrice: number
  sellPrice: number
  minStock: number
  currentStock: number
  image?: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  cpf: string
  phone: string
  email?: string
  address?: string
  city?: string
  state?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type PaymentMethod = 'dinheiro' | 'credito' | 'debito' | 'pix' | 'fiado'

export interface SaleItem {
  productId: string
  productName: string
  productCode: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Sale {
  id: string
  number: string
  customerId?: string
  customerName?: string
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  status: 'concluida' | 'cancelada' | 'fiado'
  notes?: string
  createdAt: string
}

export type OSStatus = 'aberto' | 'em_andamento' | 'aguardando_peca' | 'concluido' | 'entregue'

export interface ServiceOrder {
  id: string
  number: string
  customerId: string
  customerName: string
  deviceType: string
  brand: string
  model: string
  serialNumber?: string
  reportedDefect: string
  technicalReport?: string
  partsUsed?: string
  status: OSStatus
  serviceValue: number
  partsValue: number
  totalValue: number
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
  statusHistory: { status: OSStatus; date: string; note?: string }[]
}

export type TransactionType = 'entrada' | 'saida'
export type ExpenseCategory = 'aluguel' | 'energia' | 'agua' | 'fornecedor' | 'salario' | 'transporte' | 'marketing' | 'manutencao' | 'outros'

export interface FinancialTransaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  category?: ExpenseCategory
  paymentMethod?: PaymentMethod
  referenceId?: string
  date: string
  createdAt: string
}

export interface StoreSettings {
  store: {
    name: string
    logo: string
    address: string
    phone: string
    cnpj: string
    city: string
    state: string
    hours: string
  }
  receipt: {
    showLogo: boolean
    showCNPJ: boolean
    showAddress: boolean
    thankYouMessage: string
    terms: string
    footerText: string
    format: 'simple' | 'detailed'
  }
  os: {
    showLogo: boolean
    showFiscalData: boolean
    defaultMessage: string
    validityDays: number
    autoNumber: boolean
  }
  rules: {
    paymentMethods: PaymentMethod[]
    allowCredit: boolean
    creditLimit: number
    requireCPF: boolean
    printAfterSale: boolean
  }
  print: {
    paperWidth: '58mm' | '80mm' | 'A4'
    fontSize: 'small' | 'medium' | 'large'
    showBarcode: boolean
    showQRCode: boolean
    copies: number
  }
}

export interface DashboardKPIs {
  todaySales: number
  todayRevenue: number
  monthRevenue: number
  lowStockCount: number
  openOSCount: number
  recentSales: Sale[]
  recentOS: ServiceOrder[]
  salesLast7Days: { date: string; total: number }[]
}
