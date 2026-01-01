"use client"


import { useState } from "react"
import { WifiOff, Wifi, Bug, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useOffline } from "./offline-provider"

export function OfflineSimulator() {
  const { simulateOffline, setSimulateOffline, queuedPayments, syncQueue, isSyncing, isOnline } = useOffline()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleClearQueue = () => {
    if (confirm("Are you sure you want to clear all queued payments?")) {
      localStorage.removeItem("offline_payments_queue")
      window.location.reload()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          size="sm"
          variant="outline"
          className="shadow-lg bg-white border-slate-300"
        >
          <Bug className="w-4 h-4 mr-2" />
          Test Offline Mode
        </Button>
      ) : (
        <Card className="w-80 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Offline Mode Simulator</CardTitle>
              <Button onClick={() => setIsExpanded(false)} variant="ghost" size="sm">
                ✕
              </Button>
            </div>
            <CardDescription className="text-xs">Test offline payment queueing and sync</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Offline Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                {simulateOffline ? (
                  <WifiOff className="w-4 h-4 text-red-600" />
                ) : (
                  <Wifi className="w-4 h-4 text-green-600" />
                )}
                <Label htmlFor="offline-mode" className="text-sm cursor-pointer">
                  Simulate Offline
                </Label>
              </div>
              <Switch
                id="offline-mode"
                checked={simulateOffline}
                onCheckedChange={(checked) => {
                  setSimulateOffline(checked)
                  console.log(`[v0] Offline mode ${checked ? "enabled" : "disabled"}`)
                }}
              />
            </div>

            {/* Status Display */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <Badge variant={isOnline ? "default" : "destructive"}>{isOnline ? "Online" : "Offline"}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Queued Payments:</span>
                <Badge variant="outline">{queuedPayments.length}</Badge>
              </div>
              {queuedPayments.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Pending:</span>
                  <Badge variant="secondary">{queuedPayments.filter((p) => p.status === "pending").length}</Badge>
                </div>
              )}
              {queuedPayments.filter((p) => p.status === "error").length > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Failed:</span>
                  <Badge variant="destructive">{queuedPayments.filter((p) => p.status === "error").length}</Badge>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={syncQueue}
                disabled={isSyncing || !isOnline || queuedPayments.length === 0}
                size="sm"
                className="flex-1"
              >
                <RefreshCw className={`w-3 h-3 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                Sync Now
              </Button>
              <Button onClick={handleClearQueue} disabled={queuedPayments.length === 0} size="sm" variant="destructive">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-xs text-slate-600 space-y-1 pt-2 border-t">
              <p className="font-medium">Test Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-500">
                <li>Toggle "Simulate Offline" on</li>
                <li>Submit payment(s) to queue them</li>
                <li>Toggle "Simulate Offline" off</li>
                <li>Watch auto-sync or click "Sync Now"</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
