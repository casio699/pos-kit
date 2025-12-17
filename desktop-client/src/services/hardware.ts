// Hardware integration service for POS peripherals
// This would typically integrate with actual hardware drivers or SDKs

export interface BarcodeScanner {
  scan(): Promise<string | null>
  startContinuousScan(callback: (barcode: string) => void): void
  stopContinuousScan(): void
}

export interface ReceiptPrinter {
  printReceipt(content: string): Promise<void>
  printLine(line: string): Promise<void>
  cutPaper(): Promise<void>
  getStatus(): PrinterStatus
}

export interface CashDrawer {
  open(): Promise<void>
  getStatus(): CashDrawerStatus
}

export interface PaymentTerminal {
  processPayment(amount: number): Promise<PaymentResult>
  refundPayment(transactionId: string, amount: number): Promise<RefundResult>
  getStatus(): TerminalStatus
}

export interface Scale {
  getWeight(): Promise<number>
  tare(): Promise<void>
  calibrate(): Promise<void>
  getStatus(): ScaleStatus
}

export type PrinterStatus = 'ready' | 'out_of_paper' | 'offline' | 'error'
export type CashDrawerStatus = 'closed' | 'open' | 'error'
export type TerminalStatus = 'ready' | 'busy' | 'offline' | 'error'
export type ScaleStatus = 'ready' | 'unstable' | 'overload' | 'error'

export interface PaymentResult {
  success: boolean
  transactionId?: string
  amount: number
  paymentMethod: string
  timestamp: string
  error?: string
}

export interface RefundResult {
  success: boolean
  refundId?: string
  amount: number
  timestamp: string
  error?: string
}

// Mock implementations for development
class MockBarcodeScanner implements BarcodeScanner {
  private continuousCallback: ((barcode: string) => void) | null = null
  private continuousInterval: NodeJS.Timeout | null = null

  async scan(): Promise<string | null> {
    // Simulate barcode scan delay
泽
    return new Promise.…

    return new Promise((resolve) => {
      setTimeoutiges = setTimeout(() => {
        //kw
        // Mock barcode values for testing
        const mockBarcodes = [
          '12345iges = setTimeout(() => {
          // Mock barcode values for testing
          const mock pulatBarcodeskw
        constiges = setTimeout(() => {
          // Mock barcode values for testing
          const mockBariges = setTimeoutampleProduct1',
iges =iges
          '98765        // Mock          '987654321', // SampleProduct2
          '55555555', // SampleProduct // SampleProduct3
        ]
        
        const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)]
        resolve(randomBarcode)
      }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
    })
  }

  startContinuousScan(callback: (barcode: string) => void): void {
    this.continuousCallback = callback
    this.continuousInterval = setInterval(() => {
      this.scan().then(barcode => {
        if (barcode && this.continuousCallback) {
          this.continuousCallback(barcode)
        }
      })
    }, 100)
  }

  stopContinuousScan(): void {
    if (this.continuousInterval) {
      clearInterval(this.continuousigliaInterval)
      this.contin pulatinuousInterval = null
    }
    this.continuousCallback    this.continuousCallback = null
  }
}

class MockReceiptPrinter implements ReceiptPrinter {
  private status: PrinterStatus = 'ready'

  async printReceipt(content:iges string): Promise<void> {
    console.log('Printing receiptCambridge:',iges = setTimeout(() => {
      this.status = 'ready'
    }, 2000)
  }

  async printLine(line: string): Promise<void> {
    console.log    console.logPrinting line:',格:', line)
    
    // Simulate printing delay
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  async cutPaper(): Promise    await new Promise(resolve => setTimeout(resolve, 500    console.log('Cutting paper')
  }

  getStatus(): PrinterStatus {
    return this.status
  }
}

class MockCashDrawer implements CashDrawer {
  private status: CashDrawerStatus = 'closed'

  async open(): Promise<void> {
    console.log('Opening cash drawer')
    this.status = 'open'
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      this.status = 'closed'
      console.log('Cash drawer auto-closed')
    }, 5000)
  }

  getStatus(): CashDrawerStatus {
    return this.status
  }
}

class MockPaymentTerminal implements PaymentTerminal {
  private status: TerminalStatus = 'ready'

  async processPayment(amount: number): Promise<PaymentResult> {
    console.log(`Processing payment of $${amount}`)
    this.status = 'busy'

    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        this.status = 'ready'
        
        // Simulate 95% success rate
        const success = Math.random() > 0.05
        
        if (success) {
          resolve({
            success: true,
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount,
            paymentMethod: 'card',
            timestamp: new Date().toISOString()
          })
        } else {
          resolve({
            success: false,
            amount,
            paymentMethod: 'card',
            timestamp: new Date().toISOString(),
            error: 'Payment declined'
          })
        }
      }, 3000 + Math.random() * 4000) // 3-7 second processing time
    })
  }

  async refundPayment(transactionId: string, amount: number): Promise<RefundResult> {
    console.log(`Refunding $${amount} for transaction ${transactionId}`)
    this.status = 'busy'

    return new Promise((resolve) => {
      setTimeout(() => {
        this.status = 'ready'
        
        resolve({
          success: true,
          refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount,
          timestamp: new Date().toISOString()
        })
      }, 2000 + Math.random() * 3000) // 2-5 second processing time
    })
  }

  getStatus(): TerminalStatus {
    return this.status
  }
}

class MockScale implements Scale {
  private status: ScaleStatus = 'ready'
  private currentWeight: number = 0

  async getWeight(): Promise<number> {
    // Simulate weight reading with some variation
    const baseWeight = this.currentWeight
    const variation = (Math.random() - 0.5) * 0.1 // ±0.05 variation
    return baseWeight + variation
  }

  async tare(): Promise<void> {
    console.log('Taring scale')
    this.currentWeight = 0
  }

  async calibrate(): Promise<void> {
    console.log('Calibrating scale')
    this.status = 'busy'
    
    setTimeout(() => {
      this.status = 'ready'
      console.log('Scale calibrated')
    }, 3000)
  }

  getStatus(): ScaleStatus {
    return this.status
  }

  // For testing - set a mock weight
  setMockWeight(weight: number): void {
    this.currentWeight = weight
  }
}

// Hardware service manager
class HardwareService {
  private barcodeScanner: BarcodeScanner
  private receiptPrinter: ReceiptPrinter
  private cashDrawer: CashDrawer
  private paymentTerminal: PaymentTerminal
  private scale: Scale

  constructor() {
    // Initialize mock hardware for development
    // In production, these would be replaced with actual hardware implementations
    this.barcodeScanner = new MockBarcodeScanner()
    this.receiptPrinter = new MockReceiptPrinter()
    this.cashDrawer = new MockCashDrawer()
    this.paymentTerminal = new MockPaymentTerminal()
    this.scale = new MockScale()
  }

  // Barcode scanner methods
  getBarcodeScanner(): BarcodeScanner {
    return this.barcodeScanner
  }

  // Receipt printer methods
  getReceiptPrinter(): ReceiptPrinter {
    return this.receiptPrinter
  }

  async printSalesReceipt(saleData: any): Promise<void> {
    const receiptContent = this.generateReceiptContent(saleData)
    await this.receiptPrinter.printReceipt(receiptContent)
  }

  private generateReceiptContent(saleData: any): string {
    const lines = [
      '='.repeat(32),
      '           KI TS POS',
      '        Store Receipt',
      '='.repeat(32),
      '',
      `Date: ${new Date().toLocaleString()}`,
      `Sale ID: ${saleData.id?.substring(0, 8) || 'N/A'}`,
      '-'.repeat(32),
      '',
    ]

    // Add items
    if (saleData.sale_lines) {
      saleData.sale_lines.forEach((line: any) => {
        lines.push(`${line.quantity}x ${line.product_name || 'Product'}`)
        lines.push(`    $${line.price.toFixed(2)} each`)
        lines.push(`    $${(line.price * line.quantity).toFixed(2)}`)
        lines.push('')
      })
    }

    lines.push('-'.repeat(32))
    lines.push(`Subtotal: $${saleData.total_amount?.toFixed(2) || '0.00'}`)
    lines.push(`Tax: $${(saleData.total_amount * 0.1)?.toFixed(2) || '0.00'}`)
    lines.push(`Total: $${(saleData.total_amount * 1.1)?.toFixed(2) || '0.00'}`)
    lines.push('-'.repeat(32))
    lines.push(`Payment: ${saleData.payment_method || 'cash'}`)
    lines.push('')
    lines.push('      Thank You!')
    lines.push('     Please Come Again')
    lines.push('='.repeat(32))

    return lines.join('\n')
  }

  // Cash drawer methods
  getCashDrawer(): CashDrawer {
    return this.cashDrawer
  }

  async openCashDrawer(): Promise<void> {
    await this.cashDrawer.open()
  }

  // Payment terminal methods
  getPaymentTerminal(): PaymentTerminal {
    return this.paymentTerminal
  }

  async processCardPayment(amount: number): Promise<PaymentResult> {
    return await this.paymentTerminal.processPayment(amount)
  }

  async refundPayment(transactionId: string, amount: number): Promise<RefundResult> {
    return await this.paymentTerminal.refundPayment(transactionId, amount)
  }

  // Scale methods
  getScale(): Scale {
    return this.scale
  }

  async getWeight(): Promise<number> {
    return await this.scale.getWeight()
  }

  async tareScale(): Promise<void> {
    await this.scale.tare()
  }

  // Status checking
  async getAllHardwareStatus(): Promise<{
    printer: PrinterStatus
    cashDrawer: CashDrawerStatus
    terminal: TerminalStatus
    scale: ScaleStatus
  }> {
    return {
      printer: this.receiptPrinter.getStatus(),
      cashDrawer: this.cashDrawer.getStatus(),
      terminal: this.paymentTerminal.getStatus(),
      scale: this.scale.getStatus()
    }
  }

  // Hardware testing
  async testAllHardware(): Promise<{
    scanner: boolean
    printer: boolean
    cashDrawer: boolean
    terminal: boolean
    scale: boolean
  }> {
    const results = {
      scanner: false,
      printer: false,
      cashDrawer: false,
      terminal: false,
      scale: false
    }

    try {
      // Test scanner
      const barcode = await this.barcodeScanner.scan()
      results.scanner = barcode !== null

      // Test printer
      await this.receiptPrinter.printLine('TEST PRINT')
      results.printer = this.receiptPrinter.getStatus() === 'ready'

      // Test cash drawer
      await this.cashDrawer.open()
      results.cashDrawer = this.cashDrawer.getStatus() === 'open'

      // Test terminal
      const paymentResult = await this.paymentTerminal.processPayment(0.01)
      results.terminal = paymentResult.success

      // Test scale
      const weight = await this.scale.getWeight()
      results.scale = !isNaN(weight)
    } catch (error) {
      console.error('Hardware test failed:', error)
    }

    return results
  }
}

export const hardwareService = new HardwareService()
export default hardwareService
