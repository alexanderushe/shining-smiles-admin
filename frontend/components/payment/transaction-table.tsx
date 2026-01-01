
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const transactions = [
  {
    id: "TXN-2847",
    student: "Emily Rodriguez",
    studentId: "STU-4521",
    type: "Tuition Fee",
    amount: 1850,
    date: "2024-01-15",
    status: "completed",
    method: "Credit Card",
    direction: "in",
  },
  {
    id: "TXN-2846",
    student: "Marcus Chen",
    studentId: "STU-3892",
    type: "Transport Fee",
    amount: 450,
    date: "2024-01-15",
    status: "completed",
    method: "Bank Transfer",
    direction: "in",
  },
  {
    id: "TXN-2845",
    student: "Sarah Williams",
    studentId: "STU-5673",
    type: "Books & Materials",
    amount: 320,
    date: "2024-01-14",
    status: "pending",
    method: "Digital Wallet",
    direction: "in",
  },
  {
    id: "TXN-2844",
    student: "David Park",
    studentId: "STU-2914",
    type: "Activity Fee",
    amount: 180,
    date: "2024-01-14",
    status: "completed",
    method: "Mobile Payment",
    direction: "in",
  },
  {
    id: "TXN-2843",
    student: "Supplier Payment",
    studentId: "SUP-1023",
    type: "Facility Supplies",
    amount: 2500,
    date: "2024-01-13",
    status: "completed",
    method: "Bank Transfer",
    direction: "out",
  },
  {
    id: "TXN-2842",
    student: "Jessica Thompson",
    studentId: "STU-7821",
    type: "Tuition Fee",
    amount: 1850,
    date: "2024-01-13",
    status: "failed",
    method: "Credit Card",
    direction: "in",
  },
  {
    id: "TXN-2841",
    student: "Michael Brown",
    studentId: "STU-4456",
    type: "Late Fee",
    amount: 50,
    date: "2024-01-12",
    status: "completed",
    method: "Credit Card",
    direction: "in",
  },
  {
    id: "TXN-2840",
    student: "Staff Salary",
    studentId: "EMP-2103",
    type: "Monthly Salary",
    amount: 4200,
    date: "2024-01-12",
    status: "completed",
    method: "Bank Transfer",
    direction: "out",
  },
]

export function TransactionTable() {
  return (
    <Card className="border-slate-200">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Transaction ID</TableHead>
              <TableHead className="font-semibold text-slate-700">Student/Payee</TableHead>
              <TableHead className="font-semibold text-slate-700">Type</TableHead>
              <TableHead className="font-semibold text-slate-700">Amount</TableHead>
              <TableHead className="font-semibold text-slate-700">Date</TableHead>
              <TableHead className="font-semibold text-slate-700">Method</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-slate-50">
                <TableCell className="font-medium text-slate-700">{transaction.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-800">{transaction.student}</p>
                    <p className="text-xs text-slate-500">{transaction.studentId}</p>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">{transaction.type}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {transaction.direction === "in" ? (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-rose-600" />
                    )}
                    <span
                      className={`font-semibold ${
                        transaction.direction === "in" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      ${transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">{transaction.date}</TableCell>
                <TableCell className="text-slate-600">{transaction.method}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      transaction.status === "completed"
                        ? "default"
                        : transaction.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                    className={
                      transaction.status === "completed"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : transaction.status === "pending"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                          : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                    }
                  >
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
