"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, AlertTriangle } from "lucide-react"

interface Payment {
    id: number
    receipt_number: string
    student?: {
        first_name: string
        last_name: string
        student_number: string
    }
    amount: number
    status: string
    payment_method: string
    date: string
}

interface VoidPaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    payment: Payment | null
    onVoided: () => void
}

export function VoidPaymentDialog({ open, onOpenChange, payment, onVoided }: VoidPaymentDialogProps) {
    const [voidReason, setVoidReason] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const handleVoid = async () => {
        if (!payment) return

        if (!voidReason.trim()) {
            setError("Void reason is required")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            const { apiClient } = await import("../../src/services/api/client")
            await apiClient.payments.void(payment.id, voidReason)

            setVoidReason("")
            onOpenChange(false)
            onVoided()
        } catch (err: any) {
            console.error("Error voiding payment:", err)
            setError(err.response?.data?.detail || err.response?.data?.void_reason || "Failed to void payment")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        setVoidReason("")
        setError("")
        onOpenChange(false)
    }

    if (!payment) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-rose-600">
                        <AlertTriangle className="h-5 w-5" />
                        Void Payment
                    </DialogTitle>
                    <DialogDescription>
                        This action will mark the payment as voided. This cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Payment Details */}
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Receipt Number:</span>
                            <span className="font-mono font-semibold">{payment.receipt_number}</span>
                        </div>
                        {payment.student && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Student:</span>
                                <span className="font-medium">
                                    {payment.student.first_name} {payment.student.last_name} ({payment.student.student_number})
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-semibold">${payment.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Method:</span>
                            <span>{payment.payment_method}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{new Date(payment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current Status:</span>
                            <span className="font-medium capitalize">{payment.status}</span>
                        </div>
                    </div>

                    {/* Void Reason Input */}
                    <div className="space-y-2">
                        <Label htmlFor="void_reason">
                            Void Reason <span className="text-rose-500">*</span>
                        </Label>
                        <Textarea
                            id="void_reason"
                            placeholder="e.g., Duplicate payment, Amount error, Cancelled by parent..."
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            This reason will be recorded in the audit trail and cannot be changed later.
                        </p>
                    </div>

                    {/* Warning Alert */}
                    <Alert variant="destructive" className="bg-rose-50 text-rose-900 border-rose-200">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            <strong>Warning:</strong> Voiding a {payment.status} payment will permanently mark it as invalid.
                            {payment.status === 'posted' && " If this payment was included in a reconciliation, the reconciliation will need to be reviewed."}
                        </AlertDescription>
                    </Alert>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleVoid}
                        disabled={isSubmitting || !voidReason.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Voiding...
                            </>
                        ) : (
                            "Void Payment"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
