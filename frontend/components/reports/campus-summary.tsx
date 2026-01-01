
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useCampus } from "@/lib/campus-context"

export function CampusSummary() {
  const { campuses } = useCampus()

  const campusData = campuses
    .filter((c) => c.active)
    .map((campus) => ({
      name: campus.name,
      students: Math.floor(Math.random() * 500) + 500,
      expected: Math.floor(Math.random() * 200000) + 400000,
      collected: 0,
      outstanding: 0,
    }))
    .map((campus) => ({
      ...campus,
      collected: Math.floor(campus.expected * (0.7 + Math.random() * 0.25)),
      outstanding: 0,
    }))
    .map((campus) => ({
      ...campus,
      outstanding: campus.expected - campus.collected,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Campus-Level Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Campus</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Students</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Expected Revenue</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Collected</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Outstanding</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Collection Rate</th>
              </tr>
            </thead>
            <tbody>
              {campusData.map((campus) => {
                const percentage = (campus.collected / campus.expected) * 100
                return (
                  <tr key={campus.name} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{campus.name} Campus</td>
                    <td className="py-3 px-4 text-right">{campus.students}</td>
                    <td className="py-3 px-4 text-right">${campus.expected.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">
                      ${campus.collected.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      ${campus.outstanding.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="flex-1" />
                        <span className="text-sm font-medium w-12 text-right">{percentage.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
