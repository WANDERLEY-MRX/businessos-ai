import { Product, Customer, Sale, ServiceOrder, FinancialTransaction, StoreSettings } from '../lib/types'

export const defaultSettings: StoreSettings = {
  store: {
    name: 'BusinessOS AI',
    logo: '',
    address: '',
    phone: '',
    cnpj: '',
    city: '',
    state: '',
    hours: '08:00 - 18:00',
  },
  receipt: {
    showLogo: true,
    showCNPJ: true,
    showAddress: true,
    thankYouMessage: 'Obrigado pela preferência!',
    terms: 'Trocas em até 7 dias com nota fiscal.',
    footerText: 'Volte sempre!',
    format: 'detailed',
  },
  os: {
    showLogo: true,
    showFiscalData: true,
    defaultMessage: 'Aguardando análise técnica.',
    validityDays: 30,
    autoNumber: true,
  },
  rules: {
    paymentMethods: ['dinheiro', 'credito', 'debito', 'pix', 'fiado'],
    allowCredit: true,
    creditLimit: 500,
    requireCPF: false,
    printAfterSale: false,
  },
  print: {
    paperWidth: '80mm',
    fontSize: 'medium',
    showBarcode: false,
    showQRCode: false,
    copies: 1,
  },
}

export const seedProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    code: 'PROD001',
    name: 'Capa iPhone 15',
    brand: 'Genérico',
    category: 'Acessórios',
    description: 'Capa protetora para iPhone 15',
    costPrice: 15.0,
    sellPrice: 39.9,
    minStock: 10,
    currentStock: 50,
  },
  {
    code: 'PROD002',
    name: 'Película de Vidro iPhone 15',
    brand: 'Genérico',
    category: 'Acessórios',
    description: 'Película de vidro temperado',
    costPrice: 5.0,
    sellPrice: 24.9,
    minStock: 20,
    currentStock: 100,
  },
  {
    code: 'PROD003',
    name: 'Carregador USB-C 20W',
    brand: 'Baseus',
    category: 'Carregadores',
    description: 'Carregador rápido USB-C',
    costPrice: 30.0,
    sellPrice: 79.9,
    minStock: 5,
    currentStock: 25,
  },
  {
    code: 'PROD004',
    name: 'Fone Bluetooth TWS',
    brand: 'QCY',
    category: 'Fones',
    description: 'Fone de ouvido sem fio',
    costPrice: 45.0,
    sellPrice: 129.9,
    minStock: 5,
    currentStock: 15,
  },
  {
    code: 'PROD005',
    name: 'Cabear USB-C 1m',
    brand: 'Genérico',
    category: 'Cabos',
    description: 'Cabo de dados USB-C',
    costPrice: 8.0,
    sellPrice: 22.9,
    minStock: 15,
    currentStock: 80,
  },
]

export const seedCustomers: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'João Silva',
    cpf: '123.456.789-00',
    phone: '(11) 99999-1234',
    email: 'joao@email.com',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
  },
  {
    name: 'Maria Santos',
    cpf: '987.654.321-00',
    phone: '(11) 98888-5678',
    email: 'maria@email.com',
  },
  {
    name: 'Pedro Oliveira',
    cpf: '456.789.123-00',
    phone: '(21) 97777-9012',
  },
]

export const seedSales: Omit<Sale, 'id' | 'number' | 'createdAt'>[] = [
  {
    customerId: '',
    customerName: 'João Silva',
    items: [
      {
        productId: '',
        productName: 'Capa iPhone 15',
        productCode: 'PROD001',
        quantity: 2,
        unitPrice: 39.9,
        total: 79.8,
      },
      {
        productId: '',
        productName: 'Película de Vidro iPhone 15',
        productCode: 'PROD002',
        quantity: 1,
        unitPrice: 24.9,
        total: 24.9,
      },
    ],
    subtotal: 104.7,
    discount: 0,
    total: 104.7,
    paymentMethod: 'pix',
    status: 'concluida',
  },
  {
    customerId: '',
    customerName: 'Maria Santos',
    items: [
      {
        productId: '',
        productName: 'Carregador USB-C 20W',
        productCode: 'PROD003',
        quantity: 1,
        unitPrice: 79.9,
        total: 79.9,
      },
    ],
    subtotal: 79.9,
    discount: 0,
    total: 79.9,
    paymentMethod: 'credito',
    status: 'concluida',
  },
]

export const seedServiceOrders: Omit<ServiceOrder, 'id' | 'number' | 'createdAt' | 'updatedAt' | 'statusHistory'>[] = [
  {
    customerId: '',
    customerName: 'Pedro Oliveira',
    deviceType: 'Smartphone',
    brand: 'Samsung',
    model: 'Galaxy S23',
    reportedDefect: 'Tela não liga',
    status: 'em_andamento',
    serviceValue: 150.0,
    partsValue: 0,
    totalValue: 150.0,
  },
]

export const seedTransactions: Omit<FinancialTransaction, 'id' | 'createdAt'>[] = [
  {
    type: 'entrada',
    description: 'Venda #001 - João Silva',
    amount: 104.7,
    paymentMethod: 'pix',
    date: new Date().toISOString().split('T')[0],
  },
  {
    type: 'entrada',
    description: 'Venda #002 - Maria Santos',
    amount: 79.9,
    paymentMethod: 'credito',
    date: new Date().toISOString().split('T')[0],
  },
  {
    type: 'saida',
    description: 'Aluguel',
    amount: 2500.0,
    category: 'aluguel',
    date: new Date().toISOString().split('T')[0],
  },
]
