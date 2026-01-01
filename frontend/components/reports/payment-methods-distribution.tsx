
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useCampus } from "@/lib/campus-context"

export function PaymentMethodsDistribution() {
  const { selectedCampus } = useCampus()

  const data = [
    { name: "Cash", value: 35, amount: 99575, color: "#06b6d4" },
    { name: "Bank Transfer", value: 28, amount: 79660, color: "#10b981" },
    { name: "Card Payment", value: 22, amount: 62590, color: "#8b5cf6" },
    { name: "Online Payment", value: 12, amount: 34140, color: "#f59e0b" },
    { name: "Cheque", value: 3, amount: 8535, color: "#64748b" },
  ]

  const total = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Payment Methods Distribution</CardTitle>
        <CardDescription>
          Breakdown of payment methods used {selectedCampus === "all" ? "across all campuses" : "for selected campus"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any, name: string, props: any) => [
                    `${value}% ($${props.payload.amount.toLocaleString()})`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1">
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-slate-900 mb-1">Total Revenue</h3>
              <p className="text-2xl font-bold text-slate-900">${total.toLocaleString()}</p>
            </div>
            <div className="space-y-3">
              {data.map((method) => (
                <div
                  key={method.name}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: method.color }} />
                    <span className="text-sm font-medium text-slate-700">{method.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">{method.value}%</div>
                    <div className="text-xs text-slate-500">${method.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
