import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Clock } from "lucide-react"

const stats = [
  {
    label: "Total Revenue",
    value: "$124,580",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    label: "Total Expenses",
    value: "$89,240",
    change: "+8.2%",
    trend: "up",
    icon: TrendingDown,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    label: "Net Profit",
    value: "$35,340",
    change: "+18.4%",
    trend: "up",
    icon: TrendingUp,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Pending Payments",
    value: "$12,450",
    change: "24 invoices",
    trend: "neutral",
    icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
]

export function PaymentStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p
                    className={`text-xs font-medium ${
                      stat.trend === "up"
                        ? "text-emerald-600"
                        : stat.trend === "down"
                          ? "text-rose-600"
                          : "text-slate-500"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
