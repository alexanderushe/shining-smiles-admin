
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { useCampus } from "@/lib/campus-context"

export function CampusPerformanceChart() {
  const { campuses } = useCampus()

  const data = campuses
    .filter((c) => c.active)
    .map((campus, index) => ({
      campus: campus.name,
      collected: 320000 + index * 25000 + Math.floor(Math.random() * 50000),
      outstanding: 35000 + Math.floor(Math.random() * 25000),
      target: 450000,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Campus Performance Comparison</CardTitle>
        <CardDescription>Revenue collected, outstanding debts, and targets by campus</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="campus" tick={{ fill: "#64748b", fontSize: 11 }} stroke="#cbd5e1" />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 12 }}
              stroke="#cbd5e1"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: any) => `$${value.toLocaleString()}`}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue Collected" />
            <Bar dataKey="outstanding" fill="#ef4444" radius={[4, 4, 0, 0]} name="Outstanding Debts" />
            <Bar dataKey="target" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Target" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
