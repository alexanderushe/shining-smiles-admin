
import { Card, CardContent } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Badge } from "@/components/ui/badge"

const progressData = [
  { test: "Test 1", score: 65 },
  { test: "Test 2", score: 79 },
  { test: "Test 3", score: 75 },
  { test: "Test 4", score: 85 },
  { test: "Test 5", score: 78 },
  { test: "Test 6", score: 82 },
]

const subjects = [
  { name: "All", active: true },
  { name: "Maths", color: "bg-cyan-500" },
  { name: "Science", color: "bg-rose-500" },
  { name: "English", color: "bg-yellow-500" },
  { name: "History", color: "bg-green-500" },
]

export function StudentProgressChart() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-end gap-2 mb-6">
          {subjects.map((subject) => (
            <Badge
              key={subject.name}
              variant={subject.active ? "default" : "outline"}
              className={`${subject.active ? "bg-slate-700 hover:bg-slate-700" : "hover:bg-muted"}`}
            >
              {subject.color && <span className={`w-2 h-2 rounded-full ${subject.color} mr-1.5`} />}
              {subject.name}
            </Badge>
          ))}
        </div>
        <div className="relative h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="test" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
                formatter={(value: number) => [`${value}%`, "Score"]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ fill: "#f43f5e", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {/* 79% Label */}
          <div className="absolute top-4 left-[35%] bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-sm">
            79%
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
