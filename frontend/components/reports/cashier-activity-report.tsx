
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

export function CashierActivityReport() {
  const cashiers = [
    {
      name: "Sarah Johnson",
      transactions: 45,
      amount: 4850,
      cash: 1820,
      card: 2130,
      bank: 900,
      shift: "Morning",
    },
    {
      name: "Michael Chen",
      transactions: 38,
      amount: 4200,
      cash: 1500,
      card: 1900,
      bank: 800,
      shift: "Morning",
    },
    {
      name: "Emily Rodriguez",
      transactions: 44,
      amount: 3400,
      cash: 1500,
      card: 1200,
      bank: 700,
      shift: "Afternoon",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Cashier Activity Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cashiers.map((cashier) => (
            <div key={cashier.name} className="border rounded-lg p-4 hover:bg-slate-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-medium">{cashier.name}</div>
                    <Badge variant="secondary" className="mt-1">
                      {cashier.shift} Shift
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">${cashier.amount.toLocaleString()}</div>
                  <div className="text-sm text-slate-500">{cashier.transactions} transactions</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-slate-600">Cash</div>
                  <div className="font-semibold">${cashier.cash.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Card</div>
                  <div className="font-semibold">${cashier.card.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Bank Transfer</div>
                  <div className="font-semibold">${cashier.bank.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600">Total Collected</div>
              <div className="text-xl font-bold mt-1">
                ${cashiers.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600">Total Transactions</div>
              <div className="text-xl font-bold mt-1">{cashiers.reduce((acc, curr) => acc + curr.transactions, 0)}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600">Active Cashiers</div>
              <div className="text-xl font-bold mt-1">{cashiers.length}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600">Avg per Cashier</div>
              <div className="text-xl font-bold mt-1">
                ${Math.round(cashiers.reduce((acc, curr) => acc + curr.amount, 0) / cashiers.length).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
