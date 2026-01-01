"use client"


import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useOffline } from "./offline-provider"
import { OfflineManager } from "@/lib/offline-manager"
import { useCampus, CAMPUSES } from "@/lib/campus-context"

interface AddPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPaymentDialog({ open, onOpenChange }: AddPaymentDialogProps) {
  const { isOnline } = useOffline()
  const { selectedCampus } = useCampus()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [studentData, setStudentData] = useState<any>(null)

  const [formData, setFormData] = useState({
    studentId: "",
    campus: selectedCampus === "all" ? "" : selectedCampus,
    feeType: "",
    amount: "",
    paymentMethod: "",
    notes: "",
  })

  const validateStudentId = (id: string) => {
    if (id.length >= 5) {
      if (id === "F-6522") {
        setStudentData({
          name: "Trisha Berge",
          class: "Class VI",
          campus: "main",
          balance: 3000,
        })
        setValidationError("")
        return true
      } else if (id === "E-8547") {
        setStudentData({
          name: "Amara Olson",
          class: "Class VII",
          campus: "main",
          balance: 450,
        })
        setValidationError("")
        return true
      } else {
        setStudentData(null)
        setValidationError("Student ID not found")
        return false
      }
    }
    setStudentData(null)
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.studentId || !formData.campus || !formData.feeType || !formData.amount || !formData.paymentMethod) {
      setValidationError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    if (!studentData) {
      setValidationError("Invalid student ID")
      setIsSubmitting(false)
      return
    }

    const recentPayments = isOnline ? [] : OfflineManager.getQueue()
    const isDuplicate = recentPayments.some(
      (p) =>
        p.studentId === formData.studentId &&
        p.feeType === formData.feeType &&
        new Date().getTime() - new Date(p.timestamp).getTime() < 24 * 60 * 60 * 1000,
    )

    if (isDuplicate) {
      setValidationError("Duplicate payment detected. This student already paid this fee type today.")
      setIsSubmitting(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (!isOnline) {
      OfflineManager.addToQueue({
        studentId: formData.studentId,
        studentName: studentData.name,
        class: studentData.class,
        campus: formData.campus,
        feeType: formData.feeType,
        amount: Number.parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        timestamp: new Date().toISOString(),
      })

      console.log("[v0] Payment queued for offline sync")
      alert("You are offline. Payment queued and will sync automatically when connection is restored.")
    } else {
      const newBalance = studentData.balance - Number.parseFloat(formData.amount)
      console.log("[v0] Payment processed. New balance:", newBalance)

      console.log("[v0] Generating PDF receipt...")

      alert(`Payment recorded successfully!\nNew Balance: $${newBalance}\nReceipt generated.`)
    }

    setIsSubmitting(false)
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      studentId: "",
      campus: selectedCampus === "all" ? "" : selectedCampus,
      feeType: "",
      amount: "",
      paymentMethod: "",
      notes: "",
    })
    setStudentData(null)
    setValidationError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Payment</DialogTitle>
          <DialogDescription>
            Record a new payment from a student. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {!isOnline && (
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You are offline. Payment will be queued and automatically synced when connection is restored.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">
                Student ID <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="studentId"
                placeholder="Enter student ID (e.g., F-6522)"
                value={formData.studentId}
                onChange={(e) => {
                  setFormData({ ...formData, studentId: e.target.value })
                  validateStudentId(e.target.value)
                }}
                onBlur={() => validateStudentId(formData.studentId)}
              />
              {studentData && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {studentData.name} - {studentData.class} (Balance: ${studentData.balance})
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="campus">
                Campus <span className="text-rose-500">*</span>
              </Label>
              <Select value={formData.campus} onValueChange={(value) => setFormData({ ...formData, campus: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campus" />
                </SelectTrigger>
                <SelectContent>
                  {CAMPUSES.filter((c) => c.id !== "all").map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feeType">
                Fee Type <span className="text-rose-500">*</span>
              </Label>
              <Select value={formData.feeType} onValueChange={(value) => setFormData({ ...formData, feeType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tuition">Tuition Fee</SelectItem>
                  <SelectItem value="transport">Transport Fee</SelectItem>
                  <SelectItem value="library">Library Fee</SelectItem>
                  <SelectItem value="lab">Lab Fee</SelectItem>
                  <SelectItem value="sports">Sports Fee</SelectItem>
                  <SelectItem value="exam">Exam Fee</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">
              Payment Method <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Debit/Credit Card</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="online">Online Payment</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {studentData && formData.amount && (
            <Alert>
              <AlertDescription>
                <strong>Current Balance:</strong> ${studentData.balance}
                <br />
                <strong>Payment Amount:</strong> ${formData.amount}
                <br />
                <strong>New Balance:</strong> ${studentData.balance - Number.parseFloat(formData.amount || "0")}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : isOnline ? "Record Payment" : "Queue Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
