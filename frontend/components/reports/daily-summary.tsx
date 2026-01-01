
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react"

export function DailySummary() {
  const stats = [
    { label: "Total Collections", value: "$12,450", change: "+12%", trend: "up" },
    { label: "Cash Payments", value: "$4,820", change: "+8%", trend: "up" },
    { label: "Card Payments", value: "$5,230", change: "+15%", trend: "up" },
    { label: "Bank Transfers", value: "$2,400", change: "-3%", trend: "down" },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Daily Summary</CardTitle>
        <span className="text-sm text-slate-500">December 23, 2025</span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">{stat.label}</span>
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-sm mt-1 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.change} from yesterday
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Transactions</div>
                <div className="text-xl font-bold">127</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Students Paid</div>
                <div className="text-xl font-bold">89</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Avg Payment</div>
                <div className="text-xl font-bold">$140</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
