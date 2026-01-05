"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
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
import { AlertCircle, CheckCircle2, Loader2, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "../../src/services/api/client"

interface Student {
  id: number
  student_number: string
  first_name: string
  last_name: string
  current_grade?: string
  campus?: { id: number; name: string }
}

interface AddPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentAdded?: () => void
}

export function AddPaymentDialog({ open, onOpenChange, onPaymentAdded }: AddPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<{ receiptNumber: string } | null>(null)

  // Student search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showResults, setShowResults] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "",
    feeType: "Tuition",
    notes: "",
    bankName: "",
    referenceId: "",
    merchantProvider: "",
  })

  // Debounced search (unchanged)
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await apiClient.students.search(searchQuery)
        setSearchResults(response.data || [])
        setShowResults(true)
      } catch (err) {
        console.error("Student search failed:", err)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    setSearchQuery(`${student.student_number} - ${student.first_name} ${student.last_name}`)
    setShowResults(false)
  }

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except decimal
    const numericValue = value.replace(/[^0-9.]/g, "")
    const parts = numericValue.split(".")
    if (parts.length > 2) return formData.amount
    if (parts[1]?.length > 2) return formData.amount
    return numericValue
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(null)
    setIsSubmitting(true)

    if (!selectedStudent || !formData.amount || !formData.paymentMethod) {
      setError("Please select a student, enter an amount, and choose a payment method")
      setIsSubmitting(false)
      return
    }

    try {
      const payload: any = {
        student: selectedStudent.id,
        amount: parseFloat(formData.amount),
        payment_method: formData.paymentMethod,
        fee_type: formData.feeType,
        status: "pending",
        // optional fields
        reference_id: formData.referenceId || null,
        bank_name: formData.bankName || null,
        merchant_provider: formData.merchantProvider || null,
      }

      const response = await apiClient.payments.create(payload)

      setSuccess({ receiptNumber: response.data.receipt_number })

      // Reset form after short delay to show success
      setTimeout(() => {
        resetForm()
        onOpenChange(false)
        if (onPaymentAdded) onPaymentAdded()
      }, 2000)

    } catch (err: any) {
      console.error("Error creating payment:", err)
      setError(err.response?.data?.detail || err.response?.data?.error || "Failed to create payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      amount: "",
      paymentMethod: "",
      feeType: "Tuition",
      notes: "",
      bankName: "",
      referenceId: "",
      merchantProvider: ""
    })
    setSelectedStudent(null)
    setSearchQuery("")
    setSearchResults([])
    setError("")
    setSuccess(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Payment</DialogTitle>
          <DialogDescription>
            Record a new payment. Receipt number is auto-generated.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Recorded!</h3>
            <p className="text-muted-foreground">
              Receipt Number: <span className="font-mono font-semibold">{success.receiptNumber}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Search */}
            <div className="space-y-2">
              <Label htmlFor="student">
                Student <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="student"
                  placeholder="Search by ID or name..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSelectedStudent(null)
                  }}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full max-w-[468px] mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-accent flex justify-between items-center"
                      onClick={() => handleStudentSelect(student)}
                    >
                      <span>
                        <span className="font-medium">{student.student_number}</span>
                        <span className="text-muted-foreground"> - {student.first_name} {student.last_name}</span>
                      </span>
                      {student.current_grade && (
                        <span className="text-xs text-muted-foreground">{student.current_grade}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Student Info */}
              {selectedStudent && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {selectedStudent.first_name} {selectedStudent.last_name} ({selectedStudent.student_number})
                    {selectedStudent.current_grade && ` - ${selectedStudent.current_grade}`}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Fee Type */}
              <div className="space-y-2">
                <Label htmlFor="feeType">Fee Type</Label>
                <Select
                  value={formData.feeType}
                  onValueChange={(value) => setFormData({ ...formData, feeType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tuition">Tuition</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Boarding">Boarding</SelectItem>
                    <SelectItem value="Registration">Registration</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount - USD Currency Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount (USD) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="pl-7 text-right font-mono"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: formatCurrency(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
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
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Debit/Credit Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields: Bank Transfer */}
            {formData.paymentMethod === "Bank Transfer" && (
              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-md">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g. Stanbic"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referenceId">Reference Number</Label>
                  <Input
                    id="referenceId"
                    placeholder="Ref #"
                    value={formData.referenceId}
                    onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Conditional Fields: Mobile Money */}
            {formData.paymentMethod === "Mobile Money" && (
              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-md">
                <div className="space-y-2">
                  <Label htmlFor="merchantProvider">Provider/Merchant</Label>
                  <Input
                    id="merchantProvider"
                    placeholder="e.g. EcoCash"
                    value={formData.merchantProvider}
                    onChange={(e) => setFormData({ ...formData, merchantProvider: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referenceId">Reference Number</Label>
                  <Input
                    id="referenceId"
                    placeholder="Ref #"
                    value={formData.referenceId}
                    onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Record Payment"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
