"use client"


import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, Mail } from "lucide-react"

interface PaymentDetailDialogProps {
  payment: {
    id: string
    studentId: string
    studentName: string
    class: string
    feeType: string
    amount: number
    paymentMethod: string
    status: string
    date: string
    receiptNo: string
    balance: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentDetailDialog({ payment, open, onOpenChange }: PaymentDetailDialogProps) {
  const handleDownloadReceipt = () => {
    // Generate PDF receipt
    console.log("[v0] Generating PDF receipt for:", payment.receiptNo)
    alert("PDF receipt downloaded!")
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  const handleEmailReceipt = () => {
    console.log("[v0] Sending email receipt for:", payment.receiptNo)
    alert("Receipt sent to student's registered email!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>Complete information about this payment transaction</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Receipt No.</p>
              <p className="text-lg font-semibold">{payment.receiptNo}</p>
            </div>
            <Badge
              variant={
                payment.status === "completed" ? "default" : payment.status === "pending" ? "secondary" : "destructive"
              }
            >
              {payment.status}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-slate-600">Student Name</p>
                <p className="font-medium">{payment.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Student ID</p>
                <p className="font-medium">{payment.studentId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-slate-600">Class</p>
                <p className="font-medium">{payment.class}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Date</p>
                <p className="font-medium">{payment.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-slate-600">Fee Type</p>
                <p className="font-medium">{payment.feeType}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Payment Method</p>
                <p className="font-medium">{payment.paymentMethod}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Amount Paid</span>
              <span className="font-semibold text-lg">${payment.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Remaining Balance</span>
              <span className={payment.balance > 0 ? "text-rose-600 font-semibold" : "text-green-600 font-semibold"}>
                ${payment.balance}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownloadReceipt} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={handlePrintReceipt} variant="outline" className="flex-1 bg-transparent">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleEmailReceipt} variant="outline" className="flex-1 bg-transparent">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
