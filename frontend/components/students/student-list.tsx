"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MoreHorizontal, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useCampus } from "@/lib/campus-context"
import { apiClient } from "../../src/services/api/client"
import type { Student } from "../../src/services/api/types"
import { AddStudentDialog } from "./add-student-dialog"

export function StudentList() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { selectedCampus } = useCampus()

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await apiClient.students.list()
      setStudents(response.data)
      // Select first student by default
      if (response.data.length > 0 && !selectedStudent) {
        setSelectedStudent(response.data[0].id)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Filter students by campus and search query
  const filteredStudents = students.filter((student) => {
    const campusId = typeof student.campus === 'object' ? student.campus.id : student.campus
    const matchesCampus = selectedCampus === "all" || campusId?.toString() === selectedCampus
    const matchesSearch = searchQuery === "" ||
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_number.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCampus && matchesSearch
  })

  return (
    <>
      <Card className="h-[calc(100vh-10rem)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Students</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for students or ID"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(100vh-18rem)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-2 py-2 text-xs font-medium text-muted-foreground">
                <div className="col-span-2">Name</div>
                <div>Student ID</div>
                <div>Grade</div>
              </div>
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`w-full grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center px-2 py-3 rounded-lg text-left transition-colors ${selectedStudent === student.id ? "bg-slate-700 text-white" : "hover:bg-muted"
                    }`}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {student.first_name[0]}{student.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{student.first_name} {student.last_name}</div>
                    <div
                      className={`text-xs ${selectedStudent === student.id ? "text-slate-300" : "text-muted-foreground"}`}
                    >
                      {student.current_grade}
                    </div>
                  </div>
                  <div className={`text-sm ${selectedStudent === student.id ? "text-slate-300" : "text-muted-foreground"}`}>
                    {student.student_number}
                  </div>
                  <div className={`text-sm ${selectedStudent === student.id ? "text-slate-300" : "text-muted-foreground"}`}>
                    {student.current_grade}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddStudentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onStudentAdded={fetchStudents}
      />
    </>
  )
}
