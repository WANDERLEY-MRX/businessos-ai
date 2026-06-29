'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { StoreInfo } from '@/components/config/store-info'
import { ReceiptConfig } from '@/components/config/receipt-config'
import { OsConfig } from '@/components/config/os-config'
import { BusinessRules } from '@/components/config/business-rules'
import { PrintConfig } from '@/components/config/print-config'

export default function ConfigPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="store">
        <TabsList>
          <TabsTrigger value="store">Dados da Loja</TabsTrigger>
          <TabsTrigger value="receipts">Recibos</TabsTrigger>
          <TabsTrigger value="os">Orçamentos/OS</TabsTrigger>
          <TabsTrigger value="rules">Regras de Negócio</TabsTrigger>
          <TabsTrigger value="print">Impressão</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <StoreInfo />
        </TabsContent>

        <TabsContent value="receipts">
          <ReceiptConfig />
        </TabsContent>

        <TabsContent value="os">
          <OsConfig />
        </TabsContent>

        <TabsContent value="rules">
          <BusinessRules />
        </TabsContent>

        <TabsContent value="print">
          <PrintConfig />
        </TabsContent>
      </Tabs>
    </div>
  )
}
