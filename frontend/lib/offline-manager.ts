export interface QueuedPayment {
  id: string
  studentId: string
  studentName: string
  class: string
  feeType: string
  amount: number
  paymentMethod: string
  notes?: string
  timestamp: string
  status: "queued" | "syncing" | "synced" | "error"
}

export class OfflineManager {
  private static QUEUE_KEY = "paymentQueue"
  private static LISTENERS: Set<() => void> = new Set()

  static getQueue(): QueuedPayment[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.QUEUE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static addToQueue(payment: Omit<QueuedPayment, "id" | "status">): void {
    const queue = this.getQueue()
    const newPayment: QueuedPayment = {
      ...payment,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "queued",
    }
    queue.push(newPayment)
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue))
    this.notifyListeners()
  }

  static async syncQueue(): Promise<{ success: number; failed: number }> {
    const queue = this.getQueue()
    let success = 0
    let failed = 0

    for (const payment of queue) {
      if (payment.status === "queued" || payment.status === "error") {
        try {
          // Update status to syncing
          this.updatePaymentStatus(payment.id, "syncing")

          // Simulate API call to sync payment
          await this.syncPayment(payment)

          // Mark as synced
          this.updatePaymentStatus(payment.id, "synced")
          success++
        } catch (error) {
          // Mark as error
          this.updatePaymentStatus(payment.id, "error")
          failed++
          console.error("[v0] Failed to sync payment:", payment.id, error)
        }
      }
    }

    // Remove synced payments
    this.removeCompletedPayments()
    return { success, failed }
  }

  private static async syncPayment(payment: QueuedPayment): Promise<void> {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(
        () => {
          // 90% success rate for demo
          if (Math.random() > 0.1) {
            resolve()
          } else {
            reject(new Error("Network error"))
          }
        },
        1000 + Math.random() * 1000,
      )
    })
  }

  private static updatePaymentStatus(id: string, status: QueuedPayment["status"]): void {
    const queue = this.getQueue()
    const updated = queue.map((p) => (p.id === id ? { ...p, status } : p))
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(updated))
    this.notifyListeners()
  }

  private static removeCompletedPayments(): void {
    const queue = this.getQueue()
    const filtered = queue.filter((p) => p.status !== "synced")
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(filtered))
    this.notifyListeners()
  }

  static subscribe(callback: () => void): () => void {
    this.LISTENERS.add(callback)
    return () => this.LISTENERS.delete(callback)
  }

  private static notifyListeners(): void {
    this.LISTENERS.forEach((callback) => callback())
  }

  static clearQueue(): void {
    localStorage.removeItem(this.QUEUE_KEY)
    this.notifyListeners()
  }
}
