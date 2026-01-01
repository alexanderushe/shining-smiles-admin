"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "../../src/services/api/client"
import { useCampus } from "@/lib/campus-context"
import { useOffline } from "./offline-provider"
import { AddPaymentDialog } from "./add-payment-dialog"
import type { Payment } from "../../src/services/api/types"

export function PaymentsList() {
  const { selectedCampus } = useCampus()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { queuedPayments } = useOffline()

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        const response = await apiClient.payments.list()

        // Ensure we have an array
        let allPayments = Array.isArray(response.data) ? response.data : []

        // Filter by campus if not "all"
        if (selectedCampus !== "all") {
          allPayments = allPayments.filter((p: any) => {
            const campusId = typeof p.student?.campus === 'object'
              ? p.student.campus.id
              : p.student?.campus
            return campusId?.toString() === selectedCampus
          })
        }

        // Sort by date, most recent first
        const sortedPayments = [...allPayments].sort((a: any, b: any) => {
          const dateA = new Date(a.payment_date || 0).getTime()
          const dateB = new Date(b.payment_date || 0).getTime()
          return dateB - dateA
        })

        setPayments(sortedPayments.slice(0, 10)) // Show last 10 payments
      } catch (error) {
        console.error('Error fetching payments:', error)
        setPayments([])
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [selectedCampus])

  const formatCurrency = (amount: number) => {
    return `$${amount?.toLocaleString() || 0}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'posted':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <div className="flex gap-2">
              {queuedPayments.length > 0 && (
                <Badge variant="outline" className="bg-yellow-50">
                  {queuedPayments.length} queued
                </Badge>
              )}
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Payment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payments found
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {payment.student?.first_name} {payment.student?.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {payment.payment_method} • {formatDate(payment.payment_date)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                      <Badge className={`text-xs ${getStatusColor(payment.status)}`}>
                        {payment.status || 'Posted'}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddPaymentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </>
  )
}
