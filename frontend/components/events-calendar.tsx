
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function EventsCalendar() {
  const [currentDate] = useState(new Date())
  const currentDay = currentDate.getDate()
  const currentMonth = currentDate.toLocaleString("default", { month: "long" })
  const currentYear = currentDate.getFullYear()

  // Get first day of month and total days
  const firstDay = new Date(currentYear, currentDate.getMonth(), 1).getDay()
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate()

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  // Create array with empty slots for days before month starts
  const calendarDays = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1),
  )

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800">Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <div className="flex items-center justify-between mb-4">
            <button className="p-1.5 hover:bg-slate-100 rounded transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-sm font-semibold text-slate-700">
              {currentMonth} {currentYear}
            </span>
            <button className="p-1.5 hover:bg-slate-100 rounded transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-xs text-slate-400 text-center font-semibold py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const isToday = day === currentDay
              return (
                <button
                  key={idx}
                  disabled={!day}
                  className={cn(
                    "aspect-square flex items-center justify-center text-sm rounded-lg transition-colors",
                    !day && "invisible",
                    isToday && "bg-cyan-500 text-white font-semibold shadow-sm",
                    !isToday && day && "text-slate-600 hover:bg-slate-100 font-medium",
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
