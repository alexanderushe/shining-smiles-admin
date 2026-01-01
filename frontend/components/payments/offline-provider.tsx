"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { OfflineManager, type QueuedPayment } from "@/lib/offline-manager"

interface OfflineContextType {
  isOnline: boolean
  queuedPayments: QueuedPayment[]
  syncQueue: () => Promise<void>
  isSyncing: boolean
  simulateOffline: boolean
  setSimulateOffline: (value: boolean) => void
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [simulateOffline, setSimulateOffline] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [queuedPayments, setQueuedPayments] = useState<QueuedPayment[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [autoSyncTriggered, setAutoSyncTriggered] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      console.log("[v0] Device is now online")
      setIsOnline(true)
      setAutoSyncTriggered(true)
    }

    const handleOffline = () => {
      console.log("[v0] Device is now offline")
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    const updateQueue = () => {
      setQueuedPayments(OfflineManager.getQueue())
    }

    updateQueue()
    const unsubscribe = OfflineManager.subscribe(updateQueue)

    return unsubscribe
  }, [])

  useEffect(() => {
    const effectiveOnlineStatus = isOnline && !simulateOffline

    if (effectiveOnlineStatus && autoSyncTriggered && queuedPayments.length > 0 && !isSyncing) {
      console.log("[v0] Auto-syncing queued payments...")
      syncQueue()
      setAutoSyncTriggered(false)
    }
  }, [isOnline, simulateOffline, autoSyncTriggered, queuedPayments.length, isSyncing])

  const syncQueue = async () => {
    const effectiveOnlineStatus = isOnline && !simulateOffline
    if (isSyncing || !effectiveOnlineStatus) return

    setIsSyncing(true)
    console.log("[v0] Sync process started")

    try {
      const result = await OfflineManager.syncQueue()
      console.log("[v0] Sync complete:", result)

      if (result.success > 0) {
        const paymentWord = result.success > 1 ? "payments" : "payment"
        const message = `Successfully synced ${result.success} ${paymentWord}`

        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification("Payments Synced", { body: message })
        }
      }

      if (result.failed > 0) {
        console.error("[v0] Some payments failed to sync:", result.failed)
      }
    } catch (error) {
      console.error("[v0] Sync error:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const effectiveOnlineStatus = isOnline && !simulateOffline

  return (
    <OfflineContext.Provider
      value={{
        isOnline: effectiveOnlineStatus,
        queuedPayments,
        syncQueue,
        isSyncing,
        simulateOffline,
        setSimulateOffline,
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error("useOffline must be used within OfflineProvider")
  }
  return context
}
