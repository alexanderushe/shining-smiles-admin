"use client"


import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Plus, Pencil, Trash2, Users, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCampus, type ClassGrade } from "@/lib/campus-context"

export function ClassManagement() {
  const { toast } = useToast()
  const { campuses, classes, addClass, updateClass, removeClass } = useCampus()

  const managedCampuses = campuses.filter((c) => c.id !== "all")

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassGrade | null>(null)
  const [filterCampus, setFilterCampus] = useState<string>("all")

  const [formData, setFormData] = useState({
    name: "",
    campusId: "",
    capacity: "",
    teacherName: "",
    roomNumber: "",
    tuitionFee: "",
  })

  const filteredClasses = filterCampus === "all" ? classes : classes.filter((c) => c.campusId === filterCampus)

  const handleAddClass = () => {
    const newClass: ClassGrade = {
      id: `cls-${Date.now()}`,
      name: formData.name,
      campusId: formData.campusId,
      capacity: Number.parseInt(formData.capacity),
      currentEnrollment: 0,
      teacherName: formData.teacherName,
      roomNumber: formData.roomNumber,
      tuitionFee: Number.parseFloat(formData.tuitionFee),
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    }

    addClass(newClass)
    setIsAddDialogOpen(false)
    setFormData({ name: "", campusId: "", capacity: "", teacherName: "", roomNumber: "", tuitionFee: "" })

    toast({
      title: "Class Added",
      description: `${newClass.name} has been successfully added.`,
    })
  }

  const handleEditClass = () => {
    if (!editingClass) return

    updateClass(editingClass.id, {
      name: formData.name,
      campusId: formData.campusId,
      capacity: Number.parseInt(formData.capacity),
      teacherName: formData.teacherName,
      roomNumber: formData.roomNumber,
      tuitionFee: Number.parseFloat(formData.tuitionFee),
    })

    setIsEditDialogOpen(false)
    setEditingClass(null)
    setFormData({ name: "", campusId: "", capacity: "", teacherName: "", roomNumber: "", tuitionFee: "" })

    toast({
      title: "Class Updated",
      description: `${formData.name} has been successfully updated.`,
    })
  }

  const handleToggleStatus = (classGrade: ClassGrade) => {
    const newStatus = classGrade.status === "active" ? "inactive" : "active"
    updateClass(classGrade.id, { status: newStatus })

    toast({
      title: `Class ${newStatus === "active" ? "Activated" : "Deactivated"}`,
      description: `${classGrade.name} is now ${newStatus}.`,
    })
  }

  const handleDeleteClass = (classGrade: ClassGrade) => {
    removeClass(classGrade.id)
    toast({
      title: "Class Deleted",
      description: `${classGrade.name} has been removed.`,
    })
  }

  const openEditDialog = (classGrade: ClassGrade) => {
    setEditingClass(classGrade)
    setFormData({
      name: classGrade.name,
      campusId: classGrade.campusId,
      capacity: classGrade.capacity.toString(),
      teacherName: classGrade.teacherName || "",
      roomNumber: classGrade.roomNumber || "",
      tuitionFee: classGrade.tuitionFee.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const totalClasses = classes.filter((c) => c.status === "active").length
  const totalEnrollment = classes.reduce((sum, c) => sum + c.currentEnrollment, 0)
  const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0)

  const getCampusName = (campusId: string) => {
    return campuses.find((c) => c.id === campusId)?.name || "Unknown"
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              {classes.filter((c) => c.status === "inactive").length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollment}</div>
            <p className="text-xs text-muted-foreground">{totalCapacity - totalEnrollment} seats available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((totalEnrollment / totalCapacity) * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Overall capacity used</p>
          </CardContent>
        </Card>
      </div>

      {/* Class Management Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Class/Grade Management</CardTitle>
              <CardDescription>Add, edit, and manage classes across all campuses</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterCampus} onValueChange={setFilterCampus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  {managedCampuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Class
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Class</DialogTitle>
                    <DialogDescription>Enter the details for the new class or grade.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Class/Grade Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Grade 6, Form 3A"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="campus">Campus</Label>
                      <Select
                        value={formData.campusId}
                        onValueChange={(value) => setFormData({ ...formData, campusId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select campus" />
                        </SelectTrigger>
                        <SelectContent>
                          {managedCampuses.map((campus) => (
                            <SelectItem key={campus.id} value={campus.id}>
                              {campus.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          placeholder="30"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="room">Room Number</Label>
                        <Input
                          id="room"
                          placeholder="101"
                          value={formData.roomNumber}
                          onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="teacher">Teacher Name</Label>
                      <Input
                        id="teacher"
                        placeholder="Mrs. Johnson"
                        value={formData.teacherName}
                        onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tuition">Tuition Fee ($)</Label>
                      <Input
                        id="tuition"
                        type="number"
                        placeholder="5000"
                        value={formData.tuitionFee}
                        onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddClass}
                      disabled={!formData.name || !formData.campusId || !formData.capacity || !formData.tuitionFee}
                    >
                      Add Class
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class/Grade</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Enrollment</TableHead>
                <TableHead className="text-right">Tuition Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((classGrade) => (
                <TableRow key={classGrade.id}>
                  <TableCell className="font-medium">{classGrade.name}</TableCell>
                  <TableCell>{getCampusName(classGrade.campusId)}</TableCell>
                  <TableCell className="text-sm">{classGrade.teacherName || "N/A"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{classGrade.roomNumber || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm">
                      <span className="font-medium">{classGrade.currentEnrollment}</span>
                      <span className="text-muted-foreground"> / {classGrade.capacity}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">${classGrade.tuitionFee.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={classGrade.status === "active" ? "default" : "secondary"}>
                      {classGrade.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(classGrade)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClass(classGrade)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Update the class information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Class/Grade Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-campus">Campus</Label>
              <Select
                value={formData.campusId}
                onValueChange={(value) => setFormData({ ...formData, campusId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {managedCampuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-room">Room Number</Label>
                <Input
                  id="edit-room"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-teacher">Teacher Name</Label>
              <Input
                id="edit-teacher"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tuition">Tuition Fee ($)</Label>
              <Input
                id="edit-tuition"
                type="number"
                value={formData.tuitionFee}
                onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditClass}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
