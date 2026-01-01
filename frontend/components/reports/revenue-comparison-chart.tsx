
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { useCampus } from "@/lib/campus-context"

export function RevenueComparisonChart() {
  const { selectedCampus, campuses } = useCampus()

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const currentMonth = new Date().getMonth()

  const data = months.slice(0, currentMonth + 1).map((month, index) => {
    const dataPoint: any = { month }

    if (selectedCampus === "all") {
      // Show top 3 campuses for clarity
      const topCampuses = campuses.filter((c) => c.active).slice(0, 3)
      topCampuses.forEach((campus, i) => {
        const baseValue = 45000 + i * 5000
        dataPoint[campus.name] = baseValue + Math.floor(Math.random() * 15000)
      })
    } else {
      dataPoint["Collected"] = 50000 + index * 3000 + Math.floor(Math.random() * 10000)
      dataPoint["Target"] = 65000
    }

    return dataPoint
  })

  const colors = ["#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Revenue Trend Analysis</CardTitle>
        <CardDescription>
          {selectedCampus === "all"
            ? "Monthly revenue comparison across campuses"
            : "Monthly collected vs target revenue"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} stroke="#cbd5e1" />
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
            {selectedCampus === "all" ? (
              campuses
                .filter((c) => c.active)
                .slice(0, 3)
                .map((campus, index) => (
                  <Line
                    key={campus.id}
                    type="monotone"
                    dataKey={campus.name}
                    stroke={colors[index]}
                    strokeWidth={2}
                    dot={{ r: 4, fill: colors[index] }}
                    activeDot={{ r: 6 }}
                  />
                ))
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="Collected"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#10b981" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Target"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: "#ef4444" }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
