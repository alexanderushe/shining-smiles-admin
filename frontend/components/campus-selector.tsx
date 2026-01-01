
import { Building2 } from "lucide-react"
import { useCampus } from "@/lib/campus-context"

export function CampusSelector() {
  const { selectedCampus, setSelectedCampus, campuses } = useCampus()

  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-slate-600" />
      <select
        value={selectedCampus}
        onChange={(e) => setSelectedCampus(e.target.value)}
        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-medium hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
      >
        {campuses
          .filter((campus) => !campus.status || campus.status === "active" || campus.id === "all")
          .map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
      </select>
    </div>
  )
}
