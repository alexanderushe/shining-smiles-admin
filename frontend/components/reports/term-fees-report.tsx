
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useCampus } from "@/lib/campus-context"

export function TermFeesReport() {
  const { selectedCampus, campuses } = useCampus()

  const termData = [
    {
      grade: "Grade 1",
      expected: 450000,
      collected: 398000,
      outstanding: 52000,
      students: 150,
    },
    {
      grade: "Grade 2",
      expected: 465000,
      collected: 425000,
      outstanding: 40000,
      students: 155,
    },
    {
      grade: "Grade 3",
      expected: 480000,
      collected: 445000,
      outstanding: 35000,
      students: 160,
    },
    {
      grade: "Grade 4",
      expected: 510000,
      collected: 475000,
      outstanding: 35000,
      students: 170,
    },
    {
      grade: "Grade 5",
      expected: 525000,
      collected: 490000,
      outstanding: 35000,
      students: 175,
    },
  ]

  const totals = termData.reduce(
    (acc, curr) => ({
      expected: acc.expected + curr.expected,
      collected: acc.collected + curr.collected,
      outstanding: acc.outstanding + curr.outstanding,
    }),
    { expected: 0, collected: 0, outstanding: 0 },
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Term Fees Collection Report - Term 1, 2024</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Grade</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Students</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Expected</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Collected</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Outstanding</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Progress</th>
              </tr>
            </thead>
            <tbody>
              {termData.map((row) => {
                const percentage = (row.collected / row.expected) * 100
                return (
                  <tr key={row.grade} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{row.grade}</td>
                    <td className="py-3 px-4 text-right">{row.students}</td>
                    <td className="py-3 px-4 text-right">${row.expected.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">
                      ${row.collected.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      ${row.outstanding.toLocaleString()}
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
              <tr className="bg-slate-100 font-bold">
                <td className="py-3 px-4">Total</td>
                <td className="py-3 px-4 text-right">{termData.reduce((acc, curr) => acc + curr.students, 0)}</td>
                <td className="py-3 px-4 text-right">${totals.expected.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-green-600">${totals.collected.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-red-600">${totals.outstanding.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className="text-sm">
                    {((totals.collected / totals.expected) * 100).toFixed(1)}% Collection Rate
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
