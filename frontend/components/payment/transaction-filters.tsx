
import { Search, Filter, Download, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TransactionFilters() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search transactions..." className="pl-9 bg-white border-slate-200" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] bg-white border-slate-200">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all-types">
          <SelectTrigger className="w-[140px] bg-white border-slate-200">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-types">All Types</SelectItem>
            <SelectItem value="tuition">Tuition Fee</SelectItem>
            <SelectItem value="transport">Transport</SelectItem>
            <SelectItem value="books">Books</SelectItem>
            <SelectItem value="activities">Activities</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="gap-2 border-slate-200 bg-transparent">
          <Calendar className="w-4 h-4" />
          Date Range
        </Button>

        <Button variant="outline" size="sm" className="gap-2 border-slate-200 bg-transparent">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>
    </div>
  )
}
