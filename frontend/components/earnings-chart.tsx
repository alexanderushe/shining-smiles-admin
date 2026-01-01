
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { MoreHorizontal } from "lucide-react"
import { useCampus } from "@/lib/campus-context"
import { useState } from "react"

const generateRevenueData = (campus: string, year: string) => {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const multipliers: Record<string, number> = {
    all: 1,
    main: 0.35,
    north: 0.25,
    south: 0.2,
    east: 0.15,
    west: 0.05,
  }

  const multiplier = multipliers[campus] || 1

  return months.map((month, index) => ({
    month,
    collected: index <= currentMonth ? Math.round((32000 + Math.random() * 38000) * multiplier) : 0,
    debts: index <= currentMonth ? Math.round((6000 + Math.random() * 9000) * multiplier) : 0,
  }))
}

export function EarningsChart() {
  const { selectedCampus } = useCampus()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const data = generateRevenueData(selectedCampus, selectedYear)

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-800">Revenue Overview</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <span className="text-slate-600">Collected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600">Outstanding</span>
              </div>
            </div>
            <select
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
            <button className="p-1 hover:bg-slate-100 rounded">
              <MoreHorizontal className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Bar dataKey="collected" fill="#16a34a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="debts" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
