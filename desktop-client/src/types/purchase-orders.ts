export interface PurchaseOrder {
  id: string
  order_number: string
  supplier_name: string
  status: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled'
  total_amount: number
  created_at: string
  updated_at: string
  expected_delivery_date?: string
  notes?: string
  lines: PurchaseOrderLine[]
}

export interface PurchaseOrderLine {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  received_quantity: number
  product?: any
}

export interface CreatePurchaseOrderRequest {
  supplier_name: string
  expected_delivery_date?: string
  notes?: string
  lines: {
    product_id: string
    quantity: number
    unit_price: number
  }[]
}
