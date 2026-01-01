"use client"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { useState } from "react"

export function StudentBalanceSheet() {
  const [searchQuery, setSearchQuery] = useState("")

  const students = [
    {
      id: "F-6522",
      name: "Trisha Berge",
      grade: "Grade VI",
      campus: "Main",
      totalFees: 3000,
      paid: 2500,
      balance: 500,
      status: "partial",
    },
    {
      id: "E-8547",
      name: "Amara Olson",
      grade: "Grade V",
      campus: "North",
      totalFees: 2800,
      paid: 2800,
      balance: 0,
      status: "paid",
    },
    {
      id: "D-4512",
      name: "Julie Von",
      grade: "Grade VII",
      campus: "Main",
      totalFees: 3200,
      paid: 1500,
      balance: 1700,
      status: "outstanding",
    },
    {
      id: "C-9514",
      name: "Jocelyn Walker",
      grade: "Grade IV",
      campus: "South",
      totalFees: 2600,
      paid: 2600,
      balance: 0,
      status: "paid",
    },
    {
      id: "E-8221",
      name: "Jaiden Zulaur",
      grade: "Grade VI",
      campus: "East",
      totalFees: 3000,
      paid: 800,
      balance: 2200,
      status: "outstanding",
    },
  ]

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Paid</Badge>
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Partial</Badge>
      case "outstanding":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Outstanding</Badge>
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Student Balance Sheet</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search student or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Student ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Grade</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Campus</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Total Fees</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Paid</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Balance</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-600">{student.id}</td>
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4">{student.grade}</td>
                  <td className="py-3 px-4">{student.campus}</td>
                  <td className="py-3 px-4 text-right">${student.totalFees.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-green-600 font-medium">${student.paid.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-red-600 font-medium">${student.balance.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">{getStatusBadge(student.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
