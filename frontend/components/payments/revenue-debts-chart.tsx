"use client"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { MoreHorizontal } from "lucide-react"

// Data showing collected revenue vs outstanding debts by month
const data = [
  { month: "Jan", collected: 45000, outstanding: 8500 },
  { month: "Feb", collected: 52000, outstanding: 7200 },
  { month: "Mar", collected: 48000, outstanding: 9800 },
  { month: "Apr", collected: 61000, outstanding: 6500 },
  { month: "May", collected: 55000, outstanding: 8900 },
  { month: "Jun", collected: 67000, outstanding: 5400 },
  { month: "Jul", collected: 72000, outstanding: 4200 },
  { month: "Aug", collected: 68000, outstanding: 6800 },
  { month: "Sep", collected: 78000, outstanding: 5100 },
  { month: "Oct", collected: 85000, outstanding: 4500 },
  { month: "Nov", collected: 91000, outstanding: 5900 },
  { month: "Dec", collected: 98000, outstanding: 7200 },
]

export function RevenueDebtsChart() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-800">Revenue Collection vs Outstanding Debts</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Tuition fees from parents/guardians</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-600">Collected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-600">Outstanding</span>
              </div>
            </div>
            <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm">
              <option>2023</option>
              <option>2024</option>
              <option>2022</option>
            </select>
            <button className="p-1 hover:bg-slate-100 rounded">
              <MoreHorizontal className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Area
              type="monotone"
              dataKey="collected"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCollected)"
              name="Collected Revenue"
            />
            <Area
              type="monotone"
              dataKey="outstanding"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOutstanding)"
              name="Outstanding Debts"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
