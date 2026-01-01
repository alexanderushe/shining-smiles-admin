
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCampus } from "@/lib/campus-context"

export function ReportFilters() {
  const { selectedCampus, campuses } = useCampus()

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`[v0] Exporting report as ${format}`)
    // Implement export logic
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select defaultValue={selectedCampus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Campus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campuses</SelectItem>
            {campuses
              .filter((c) => c.active)
              .map((campus) => (
                <SelectItem key={campus.id} value={campus.id}>
                  {campus.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select defaultValue="today">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="term">This Term</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="term1">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="term1">Term 1 - 2024</SelectItem>
            <SelectItem value="term2">Term 2 - 2024</SelectItem>
            <SelectItem value="term3">Term 3 - 2024</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>
    </Card>
  )
}
