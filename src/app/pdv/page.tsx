'use client'

import { useState, useEffect } from 'react'
import { getProducts, createSale, getCustomers, getSettings, getNextSaleNumber, getSales } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import { Product, PaymentMethod, Customer } from '@/lib/types'
import { CartItem } from '@/components/pdv/cart'
import { ProductGrid } from '@/components/pdv/product-grid'
import { Cart } from '@/components/pdv/cart'
import { PaymentModal } from '@/components/pdv/payment-modal'

export default function PDVPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [saleNumber, setSaleNumber] = useState('000001')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadedProducts = getProducts()
    setProducts(loadedProducts)
    const sales = getSales()
    setSaleNumber((sales.length + 1).toString().padStart(6, '0'))
  }, [])

  const productGridItems = products.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    brand: p.brand,
    price: p.sellPrice,
    stock: p.currentStock,
    category: p.category,
  }))

  function addToCart(product: { id: string; name: string; code: string; price: number; stock: number }) {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.id)
      if (existingIndex >= 0) {
        return prev.map((item, i) =>
          i === existingIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          quantity: 1,
          unitPrice: product.price,
          total: product.price,
        },
      ]
    })
  }

  function removeFromCart(index: number) {
    setCartItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateQuantity(index: number, qty: number) {
    if (qty <= 0) {
      removeFromCart(index)
      return
    }
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: qty, total: qty * item.unitPrice }
          : item
      )
    )
  }

  function clearCart() {
    setCartItems([])
  }

  function calculateSubtotal(): number {
    return cartItems.reduce((acc, item) => acc + item.total, 0)
  }

  function calculateTotal(): number {
    const subtotal = calculateSubtotal()
    return subtotal
  }

  function handlePayment(paymentMethod: string, customerId?: string) {
    const subtotal = calculateSubtotal()
    const total = calculateTotal()
    const customers = getCustomers()
    const customer = customerId ? customers.find((c) => c.id === customerId) : null

    const saleItems = cartItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productCode: item.productCode,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    }))

    createSale({
      items: saleItems,
      subtotal,
      discount: 0,
      total,
      paymentMethod: paymentMethod as PaymentMethod,
      customerId: customerId || undefined,
      customerName: customer?.name,
      status: paymentMethod === 'fiado' ? 'fiado' : 'concluida',
    })

    clearCart()
    setShowPaymentModal(false)
    setSelectedCustomer(null)
    setSuccessMessage('Venda realizada com sucesso!')

    const sales = getSales()
    setSaleNumber((sales.length + 1).toString().padStart(6, '0'))

    setTimeout(() => setSuccessMessage(null), 3000)
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          {successMessage}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ponto de Venda</h1>
          <p className="text-sm text-muted-foreground">
            Venda <span className="font-mono font-semibold text-foreground">VND-{saleNumber}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ height: 'calc(100vh - 12rem)' }}>
        <div className="lg:col-span-3 overflow-hidden">
          <ProductGrid products={productGridItems} onSelect={addToCart} />
        </div>
        <div className="lg:col-span-2 overflow-hidden rounded-xl border">
          <Cart
            items={cartItems}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onClear={clearCart}
            onFinalize={() => setShowPaymentModal(true)}
          />
        </div>
      </div>

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={calculateTotal()}
        onConfirm={handlePayment}
      />
    </div>
  )
}
