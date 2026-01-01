"use client"

import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Users, UserSquare2, DollarSign, AlertCircle, Loader2 } from "lucide-react"
import { useCampus } from "@/lib/campus-context"
import { useState, useEffect } from "react"
import { apiClient } from "../src/services/api/client"

interface DashboardStats {
  students: number
  teachers: number
  parents: number
  revenueCollected: number
  outstandingDebts: number
  debtors: number
}

export function StatsCards() {
  const { selectedCampus } = useCampus()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // Fetch students count
        const studentsResponse = await apiClient.students.list()
        const allStudents = studentsResponse.data

        // Filter by campus if not "all"
        const filteredStudents = selectedCampus === "all"
          ? allStudents
          : allStudents.filter(s => {
            const campusId = typeof s.campus === 'object' ? s.campus.id : s.campus
            return campusId?.toString() === selectedCampus
          })

        // Get current term and year
        const now = new Date()
        const currentYear = now.getFullYear()
        const month = now.getMonth() + 1

        // Determine term based on month (adjust as needed for your school calendar)
        let currentTerm = "Term 1"
        if (month >= 1 && month <= 4) currentTerm = "Term 1"
        else if (month >= 5 && month <= 8) currentTerm = "Term 2"
        else currentTerm = "Term 3"

        // Try to fetch term summary for revenue data
        let revenueCollected = 0
        let outstandingDebts = 0
        let debtors = 0

        try {
          const termSummaryResponse = await apiClient.reports.termSummary({
            term: currentTerm,
            year: currentYear,
            campus: selectedCampus !== "all" ? selectedCampus : undefined
          })
          const termData = termSummaryResponse.data as any
          revenueCollected = termData?.total || 0
          // Note: The current API doesn't return outstanding debts
          // You may need to calculate this differently or add it to the backend
        } catch (error) {
          console.warn('Could not fetch term summary, using student count only:', error)
        }

        // Calculate stats
        setStats({
          students: filteredStudents.length,
          teachers: 0, // Not available in current API
          parents: 0, // Not available in current API
          revenueCollected,
          outstandingDebts,
          debtors,
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        // Set default values on error
        setStats({
          students: 0,
          teachers: 0,
          parents: 0,
          revenueCollected: 0,
          outstandingDebts: 0,
          debtors: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [selectedCampus])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`
    }
    return `$${amount}`
  }

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-5 flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      label: "Students",
      value: stats.students.toLocaleString(),
      icon: GraduationCap,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Teachers",
      value: stats.teachers > 0 ? stats.teachers.toString() : "N/A",
      icon: Users,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Parents",
      value: stats.parents > 0 ? stats.parents.toLocaleString() : "N/A",
      icon: UserSquare2,
      iconBg: "bg-pink-50",
      iconColor: "text-pink-600",
    },
    {
      label: "Revenue Collected",
      value: formatCurrency(stats.revenueCollected),
      subtitle: "This Year",
      icon: DollarSign,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Outstanding Debts",
      value: formatCurrency(stats.outstandingDebts),
      subtitle: stats.debtors > 0 ? `${stats.debtors} Debtors` : undefined,
      icon: AlertCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {statsData.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1.5">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 mb-0.5">{stat.value}</p>
                {stat.subtitle && <p className="text-xs text-slate-400 font-medium">{stat.subtitle}</p>}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
