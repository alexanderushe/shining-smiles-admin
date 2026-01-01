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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building2, Plus, Pencil, Trash2, Users, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCampus, type Campus } from "@/lib/campus-context"

export function CampusManagement() {
  const { toast } = useToast()
  const { campuses, addCampus, updateCampus, removeCampus } = useCampus()

  const managedCampuses = campuses.filter((c) => c.id !== "all")

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    principal: "",
  })

  const handleAddCampus = () => {
    const newCampus: Campus = {
      id: formData.name.toLowerCase().replace(/\s+/g, "-"),
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      principal: formData.principal,
      studentCount: 0,
      revenueCollected: 0,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    }

    addCampus(newCampus)
    setIsAddDialogOpen(false)
    setFormData({ name: "", address: "", phone: "", principal: "" })

    toast({
      title: "Campus Added",
      description: `${newCampus.name} has been successfully added.`,
    })
  }

  const handleEditCampus = () => {
    if (!editingCampus) return

    updateCampus(editingCampus.id, {
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      principal: formData.principal,
    })

    setIsEditDialogOpen(false)
    setEditingCampus(null)
    setFormData({ name: "", address: "", phone: "", principal: "" })

    toast({
      title: "Campus Updated",
      description: `${formData.name} has been successfully updated.`,
    })
  }

  const handleToggleStatus = (campus: Campus) => {
    const newStatus = campus.status === "active" ? "inactive" : "active"
    updateCampus(campus.id, { status: newStatus })

    toast({
      title: `Campus ${newStatus === "active" ? "Activated" : "Deactivated"}`,
      description: `${campus.name} is now ${newStatus}.`,
    })
  }

  const openEditDialog = (campus: Campus) => {
    setEditingCampus(campus)
    setFormData({
      name: campus.name,
      address: campus.address || "",
      phone: campus.phone || "",
      principal: campus.principal || "",
    })
    setIsEditDialogOpen(true)
  }

  const totalStudents = managedCampuses.reduce((sum, c) => sum + (c.studentCount || 0), 0)
  const totalRevenue = managedCampuses.reduce((sum, c) => sum + (c.revenueCollected || 0), 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campuses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managedCampuses.filter((c) => c.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">
              {managedCampuses.filter((c) => c.status === "inactive").length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all campuses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>
      </div>

      {/* Campus Management Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campus Management</CardTitle>
              <CardDescription>Add, edit, and manage all school campuses</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Campus
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Campus</DialogTitle>
                  <DialogDescription>Enter the details for the new campus location.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Campus Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Downtown Campus"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Street address, district"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="principal">Principal Name</Label>
                    <Input
                      id="principal"
                      placeholder="Dr. John Smith"
                      value={formData.principal}
                      onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCampus} disabled={!formData.name || !formData.address}>
                    Add Campus
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campus</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managedCampuses.map((campus) => (
                <TableRow key={campus.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{campus.name}</div>
                      <div className="text-sm text-muted-foreground">{campus.address || "N/A"}</div>
                    </div>
                  </TableCell>
                  <TableCell>{campus.principal || "N/A"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{campus.phone || "N/A"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {(campus.studentCount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${((campus.revenueCollected || 0) / 1000).toFixed(1)}k
                  </TableCell>
                  <TableCell>
                    <Badge variant={campus.status === "active" ? "default" : "secondary"}>
                      {campus.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(campus)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(campus)}
                        className="h-8 w-8"
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
            <DialogTitle>Edit Campus</DialogTitle>
            <DialogDescription>Update the campus information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Campus Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-principal">Principal Name</Label>
              <Input
                id="edit-principal"
                value={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCampus}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
