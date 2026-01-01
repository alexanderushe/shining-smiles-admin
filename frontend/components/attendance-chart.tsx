
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"

export function AttendanceChart() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-800">Attendance</CardTitle>
          <button className="p-1 hover:bg-slate-100 rounded">
            <MoreHorizontal className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-6">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="12" />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#334155"
                strokeWidth="12"
                strokeDasharray="440"
                strokeDashoffset="88"
                strokeLinecap="round"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="12"
                strokeDasharray="440"
                strokeDashoffset="-264"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Students</p>
            <p className="text-2xl font-bold text-slate-800">84%</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Teachers</p>
            <p className="text-2xl font-bold text-yellow-500">91%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
