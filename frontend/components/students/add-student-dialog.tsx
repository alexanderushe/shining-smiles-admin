"use client"

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
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "../../src/services/api/client"
import { useCampus } from "@/lib/campus-context"

interface AddStudentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onStudentAdded?: () => void
}

export function AddStudentDialog({ open, onOpenChange, onStudentAdded }: AddStudentDialogProps) {
    const { campuses } = useCampus()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        student_number: "",
        first_name: "",
        last_name: "",
        dob: "",
        current_grade: "",
        campus_id: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        // Validation
        if (!formData.student_number || !formData.first_name || !formData.last_name || !formData.campus_id) {
            setError("Please fill in all required fields")
            setIsSubmitting(false)
            return
        }

        try {
            await apiClient.students.create({
                student_number: formData.student_number,
                first_name: formData.first_name,
                last_name: formData.last_name,
                dob: formData.dob || undefined,
                current_grade: formData.current_grade || undefined,
                campus_id: parseInt(formData.campus_id),
            })

            // Success - reset form and close
            resetForm()
            onOpenChange(false)
            if (onStudentAdded) {
                onStudentAdded()
            }
        } catch (err: any) {
            console.error('Error creating student:', err)
            setError(err.response?.data?.error || err.response?.data?.student_number?.[0] || "Failed to create student. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({
            student_number: "",
            first_name: "",
            last_name: "",
            dob: "",
            current_grade: "",
            campus_id: "",
        })
        setError("")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                        Enter the student's information. Fields marked with * are required.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="student_number">
                                Student Number <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="student_number"
                                placeholder="e.g., S-2024-001"
                                value={formData.student_number}
                                onChange={(e) => setFormData({ ...formData, student_number: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="campus">
                                Campus <span className="text-rose-500">*</span>
                            </Label>
                            <Select value={formData.campus_id} onValueChange={(value) => setFormData({ ...formData, campus_id: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select campus" />
                                </SelectTrigger>
                                <SelectContent>
                                    {campuses.filter((c) => c.id !== "all").map((campus) => (
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
                            <Label htmlFor="first_name">
                                First Name <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="first_name"
                                placeholder="John"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="last_name">
                                Last Name <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="last_name"
                                placeholder="Doe"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="current_grade">Current Grade</Label>
                            <Input
                                id="current_grade"
                                placeholder="e.g., Grade 5"
                                value={formData.current_grade}
                                onChange={(e) => setFormData({ ...formData, current_grade: e.target.value })}
                            />
                        </div>
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
                                    Creating...
                                </>
                            ) : (
                                "Add Student"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
