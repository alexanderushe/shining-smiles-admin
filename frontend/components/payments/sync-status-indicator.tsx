"use client"


import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useOffline } from "./offline-provider"
import { useEffect, useState } from "react"

export function SyncStatusIndicator() {
  const { isOnline, queuedPayments, syncQueue, isSyncing } = useOffline()
  const [showSyncSuccess, setShowSyncSuccess] = useState(false)
  const [previousQueueCount, setPreviousQueueCount] = useState(0)

  const queueCount = queuedPayments.length
  const errorCount = queuedPayments.filter((p) => p.status === "error").length

  useEffect(() => {
    if (previousQueueCount > 0 && queueCount === 0 && !isSyncing) {
      setShowSyncSuccess(true)
      setTimeout(() => setShowSyncSuccess(false), 5000)
    }
    setPreviousQueueCount(queueCount)
  }, [queueCount, isSyncing])

  const handleManualSync = async () => {
    await syncQueue()
  }

  return (
    <div className="flex items-center gap-3">
      {queueCount > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              "px-2 py-1 rounded-full font-medium",
              errorCount > 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700",
            )}
          >
            {queueCount} pending
            {errorCount > 0 && ` (${errorCount} failed)`}
          </span>
        </div>
      )}

      {showSyncSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-600 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>All payments synced</span>
        </div>
      )}

      {/* Online/Offline indicator */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
          isOnline ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
        )}
      >
        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        <span>{isOnline ? "Online" : "Offline"}</span>
      </div>

      {queueCount > 0 && isOnline && (
        <Button onClick={handleManualSync} disabled={isSyncing} size="sm">
          <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </Button>
      )}

      {errorCount > 0 && (
        <Button onClick={handleManualSync} disabled={isSyncing} size="sm" variant="destructive">
          <AlertCircle className="w-4 h-4 mr-2" />
          Retry Failed
        </Button>
      )}
    </div>
  )
}
