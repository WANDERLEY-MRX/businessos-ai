import { Sale, ServiceOrder, StoreSettings } from './types'
import { formatCurrency, formatDateTime, getOSStatusLabel, getPaymentMethodLabel } from './utils'

export function printReceipt(sale: Sale, settings: StoreSettings): void {
  const html = generateReceiptHTML(sale, settings)
  openPrintWindow(html)
}

export function printOS(os: ServiceOrder, settings: StoreSettings): void {
  const html = generateOSHTML(os, settings)
  openPrintWindow(html)
}

function generateReceiptHTML(sale: Sale, settings: StoreSettings): string {
  const { store, receipt, print } = settings
  const fontSize = print.fontSize === 'small' ? '10px' : print.fontSize === 'medium' ? '12px' : '14px'
  const width = print.paperWidth === '58mm' ? '200px' : print.paperWidth === '80mm' ? '280px' : '750px'
  const isDetailed = receipt.format === 'detailed'

  let storeInfo = ''
  if (receipt.showLogo && store.logo) {
    storeInfo += `<div style="text-align:center;margin-bottom:8px;"><img src="${store.logo}" style="max-height:60px;"></div>`
  }
  storeInfo += `<div style="text-align:center;font-weight:bold;font-size:${fontSize};margin-bottom:4px;">${store.name}</div>`
  if (receipt.showCNPJ) {
    storeInfo += `<div style="text-align:center;font-size:${fontSize};">CNPJ: ${store.cnpj}</div>`
  }
  storeInfo += `<div style="text-align:center;font-size:${fontSize};">Tel: ${store.phone}</div>`
  if (receipt.showAddress) {
    storeInfo += `<div style="text-align:center;font-size:${fontSize};">${store.address} - ${store.city}/${store.state}</div>`
  }
  storeInfo += `<div style="text-align:center;font-size:${fontSize};">${store.hours}</div>`

  let itemsHTML = ''
  if (isDetailed) {
    itemsHTML += `<div style="display:flex;justify-content:space-between;border-bottom:1px solid #000;padding:4px 0;font-weight:bold;font-size:${fontSize};"><span>ITEM</span><span>DESCRIÇÃO</span><span>QTD</span><span>PREÇO</span><span>TOTAL</span></div>`
    sale.items.forEach((item, index) => {
      itemsHTML += `<div style="display:flex;justify-content:space-between;border-bottom:1px dashed #ccc;padding:4px 0;font-size:${fontSize};"><span>${String(index + 1).padStart(2, '0')}</span><span>${item.productName}</span><span>${item.quantity}</span><span>${formatCurrency(item.unitPrice)}</span><span>${formatCurrency(item.total)}</span></div>`
    })
  } else {
    itemsHTML += `<div style="border-bottom:1px solid #000;padding:4px 0;font-weight:bold;font-size:${fontSize};"><span>ITEM</span> | <span>QTD</span> | <span>TOTAL</span></div>`
    sale.items.forEach((item) => {
      itemsHTML += `<div style="border-bottom:1px dashed #ccc;padding:4px 0;font-size:${fontSize};"><span>${item.productName}</span> | <span>${item.quantity}</span> | <span>${formatCurrency(item.total)}</span></div>`
    })
  }

  const paymentLabel = getPaymentMethodLabel(sale.paymentMethod)

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; font-size: ${fontSize}; margin: 0; padding: 16px; }
    * { box-sizing: border-box; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body style="width:${width};margin:0 auto;">
  <div style="text-align:center;margin-bottom:12px;font-size:16px;font-weight:bold;">CUPOM FISCAL</div>
  ${storeInfo}
  <hr style="margin:8px 0;border-color:#000;">
  <div style="display:flex;justify-content:space-between;font-size:${fontSize};margin-bottom:8px;">
    <span>Nº ${sale.number}</span>
    <span>${formatDateTime(sale.createdAt)}</span>
  </div>
  ${sale.customerName ? `<div style="font-size:${fontSize};margin-bottom:8px;">Cliente: ${sale.customerName}</div>` : ''}
  <hr style="margin:8px 0;border-color:#000;">
  ${itemsHTML}
  <hr style="margin:8px 0;border-color:#000;">
  <div style="font-size:${fontSize};">
    <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Subtotal:</span><span>${formatCurrency(sale.subtotal)}</span></div>
    ${sale.discount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px;color:red;"><span>Desconto:</span><span>- ${formatCurrency(sale.discount)}</span></div>` : ''}
    <div style="display:flex;justify-content:space-between;font-size:${fontSize === '10px' ? '13px' : fontSize === '12px' ? '15px' : '17px'};font-weight:bold;margin-top:8px;"><span>TOTAL:</span><span>${formatCurrency(sale.total)}</span></div>
  </div>
  <hr style="margin:8px 0;border-color:#000;">
  <div style="font-size:${fontSize};margin-bottom:8px;">Pagamento: ${paymentLabel}</div>
  ${sale.notes ? `<div style="font-size:${fontSize};margin-bottom:8px;">Obs: ${sale.notes}</div>` : ''}
  <hr style="margin:8px 0;border-color:#000;">
  <div style="text-align:center;font-size:${fontSize};margin-bottom:4px;">${receipt.thankYouMessage}</div>
  <div style="text-align:center;font-size:${fontSize};margin-bottom:4px;">${receipt.terms}</div>
  <div style="text-align:center;font-size:${fontSize};">${receipt.footerText}</div>
  <div style="text-align:center;font-size:10px;margin-top:12px;">${formatDateTime(sale.createdAt)}</div>
</body>
</html>`
}

function generateOSHTML(os: ServiceOrder, settings: StoreSettings): string {
  const { store, os: osSettings, print } = settings
  const fontSize = print.fontSize === 'small' ? '10px' : print.fontSize === 'medium' ? '12px' : '14px'
  const width = print.paperWidth === '58mm' ? '200px' : print.paperWidth === '80mm' ? '280px' : '750px'

  let storeInfo = ''
  if (osSettings.showLogo && store.logo) {
    storeInfo += `<div style="text-align:center;margin-bottom:8px;"><img src="${store.logo}" style="max-height:60px;"></div>`
  }
  storeInfo += `<div style="text-align:center;font-weight:bold;font-size:${fontSize};margin-bottom:4px;">${store.name}</div>`
  if (osSettings.showFiscalData) {
    storeInfo += `<div style="text-align:center;font-size:${fontSize};">CNPJ: ${store.cnpj}</div>`
  }
  storeInfo += `<div style="text-align:center;font-size:${fontSize};">Tel: ${store.phone}</div>`
  storeInfo += `<div style="text-align:center;font-size:${fontSize};">${store.address} - ${store.city}/${store.state}</div>`

  const validityDays = osSettings.validityDays
  const defaultMessage = osSettings.defaultMessage.replace('{days}', String(validityDays))

  let statusHistoryHTML = ''
  if (os.statusHistory && os.statusHistory.length > 0) {
    statusHistoryHTML += `<div style="margin-top:12px;"><div style="font-weight:bold;margin-bottom:4px;font-size:${fontSize};">Histórico:</div>`
    os.statusHistory.forEach((entry) => {
      statusHistoryHTML += `<div style="border-bottom:1px dashed #ccc;padding:4px 0;font-size:${fontSize};"><span style="font-weight:bold;">${getOSStatusLabel(entry.status)}</span> - ${formatDateTime(entry.date)}${entry.note ? ` - ${entry.note}` : ''}</div>`
    })
    statusHistoryHTML += '</div>'
  }

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; font-size: ${fontSize}; margin: 0; padding: 16px; }
    * { box-sizing: border-box; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body style="width:${width};margin:0 auto;">
  <div style="text-align:center;margin-bottom:12px;font-size:16px;font-weight:bold;">ORDEM DE SERVIÇO Nº ${os.number}</div>
  ${storeInfo}
  <hr style="margin:8px 0;border-color:#000;">
  <div style="display:flex;justify-content:space-between;font-size:${fontSize};margin-bottom:8px;">
    <span>Data: ${formatDateTime(os.createdAt)}</span>
    <span>Status: ${getOSStatusLabel(os.status)}</span>
  </div>
  <hr style="margin:8px 0;border-color:#000;">
  <div style="font-weight:bold;font-size:${fontSize};margin-bottom:6px;">DADOS DO CLIENTE</div>
  <div style="font-size:${fontSize};margin-bottom:4px;">Nome: ${os.customerName}</div>
  <hr style="margin:8px 0;border-color:#000;">
  <div style="font-weight:bold;font-size:${fontSize};margin-bottom:6px;">DADOS DO EQUIPAMENTO</div>
  <div style="font-size:${fontSize};margin-bottom:4px;">Tipo: ${os.deviceType}</div>
  <div style="font-size:${fontSize};margin-bottom:4px;">Marca: ${os.brand}</div>
  <div style="font-size:${fontSize};margin-bottom:4px;">Modelo: ${os.model}</div>
  ${os.serialNumber ? `<div style="font-size:${fontSize};margin-bottom:4px;">Nº Série: ${os.serialNumber}</div>` : ''}
  <hr style="margin:8px 0;border-color:#000;">
  <div style="font-weight:bold;font-size:${fontSize};margin-bottom:6px;">DEFEITO RELATADO</div>
  <div style="font-size:${fontSize};margin-bottom:8px;border:1px solid #ccc;padding:8px;">${os.reportedDefect}</div>
  ${os.technicalReport ? `
  <div style="font-weight:bold;font-size:${fontSize};margin-bottom:6px;">LAUDO TÉCNICO</div>
  <div style="font-size:${fontSize};margin-bottom:8px;border:1px solid #ccc;padding:8px;">${os.technicalReport}</div>` : ''}
  ${os.partsUsed ? `
  <div style="font-weight:bold;font-size:${fontSize};margin-bottom:6px;">PEÇAS UTILIZADAS</div>
  <div style="font-size:${fontSize};margin-bottom:8px;border:1px solid #ccc;padding:8px;">${os.partsUsed}</div>` : ''}
  <hr style="margin:8px 0;border-color:#000;">
  <div style="font-weight:bold;font-size:${fontSize};margin-bottom:6px;">VALORES</div>
  <div style="font-size:${fontSize};margin-bottom:4px;">Mão de Obra: ${formatCurrency(os.serviceValue)}</div>
  <div style="font-size:${fontSize};margin-bottom:4px;">Peças: ${formatCurrency(os.partsValue)}</div>
  <div style="font-size:${fontSize};font-weight:bold;border-top:1px solid #000;padding-top:4px;margin-top:4px;">TOTAL: ${formatCurrency(os.totalValue)}</div>
  ${statusHistoryHTML}
  <hr style="margin:8px 0;border-color:#000;">
  ${os.estimatedDelivery ? `<div style="font-size:${fontSize};margin-bottom:4px;">Previsão de Entrega: ${os.estimatedDelivery}</div>` : ''}
  <div style="font-size:${fontSize};margin-bottom:8px;">${defaultMessage}</div>
  <div style="display:flex;margin-top:24px;">
    <div style="flex:1;text-align:center;border-top:1px solid #000;padding-top:4px;font-size:${fontSize};">
      <div style="margin-bottom:40px;"></div>
      Assinatura do Cliente
    </div>
    <div style="flex:1;text-align:center;border-top:1px solid #000;padding-top:4px;font-size:${fontSize};margin-left:16px;">
      <div style="margin-bottom:40px;"></div>
      Assinatura do Técnico
    </div>
  </div>
</body>
</html>`
}

function openPrintWindow(html: string): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('A janela de impressão foi bloqueada. Permita pop-ups para este site.')
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.print()
}
