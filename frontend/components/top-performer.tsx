
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const performers = [
  {
    name: "Enos Schmel",
    id: "4278",
    class: "6th Class",
    rank: "98.68%",
    photo: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Cayla Bergnaum",
    id: "2347",
    class: "8th Class",
    rank: "98.22%",
    photo: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Kathryn Hahn",
    id: "5940",
    class: "5th Class",
    rank: "97.00%",
    photo: "/placeholder.svg?height=40&width=40",
  },
]

const tabs = ["Week", "Month", "Year"]

export function TopPerformer() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-800">Top Performer</CardTitle>
          <button className="p-1 hover:bg-slate-100 rounded">
            <MoreHorizontal className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm transition-colors",
                idx === 1 ? "bg-slate-100 text-slate-700 font-medium" : "text-slate-500 hover:bg-slate-50",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-[auto_1fr_auto_auto_1fr] gap-4 text-sm text-slate-500 font-medium pb-2 border-b border-slate-200">
            <div>Photo</div>
            <div>Name</div>
            <div>ID Number</div>
            <div>Standard</div>
            <div>Rank</div>
          </div>

          {performers.map((performer) => (
            <div key={performer.id} className="grid grid-cols-[auto_1fr_auto_auto_1fr] gap-4 items-center">
              <Avatar className="w-10 h-10">
                <AvatarImage src={performer.photo || "/placeholder.svg"} />
                <AvatarFallback>{performer.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="text-slate-700 font-medium">{performer.name}</div>
              <div className="text-slate-500 text-sm">ID : {performer.id}</div>
              <div className="text-slate-600 text-sm">{performer.class}</div>
              <div className="flex items-center gap-2">
                <span className="text-rose-500 font-medium text-sm">{performer.rank}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: performer.rank }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
