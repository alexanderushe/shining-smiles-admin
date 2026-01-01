"use client"

import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, AlertCircle, Users, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "../../src/services/api/client"
import { useCampus } from "@/lib/campus-context"

export function PaymentsStats() {
  const { selectedCampus } = useCampus()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Get current term and year
        const now = new Date()
        const currentYear = now.getFullYear()
        const month = now.getMonth() + 1

        // Determine term based on month
        let currentTerm = "Term 1"
        if (month >= 1 && month <= 4) currentTerm = "Term 1"
        else if (month >= 5 && month <= 8) currentTerm = "Term 2"
        else currentTerm = "Term 3"

        const response = await apiClient.reports.termSummary({
          term: currentTerm,
          year: currentYear,
          campus: selectedCampus !== "all" ? selectedCampus : undefined
        })
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching payment stats:', error)
        // Set empty stats on error
        setStats({ total: 0, count: 0, by_method: [] })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [selectedCampus])

  const formatCurrency = (amount: number) => {
    return `$${amount?.toLocaleString() || 0}`
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </Card>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      label: "Revenue Collected",
      value: formatCurrency(stats?.total || 0),
      subtext: `${stats?.count || 0} payments`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Payment Methods",
      value: stats?.by_method?.length?.toString() || "0",
      subtext: "Different methods",
      icon: AlertCircle,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      label: "This Term",
      value: stats?.term || "N/A",
      subtext: `Year ${stats?.year || new Date().getFullYear()}`,
      icon: TrendingUp,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      label: "Total Payments",
      value: stats?.count?.toString() || "0",
      subtext: "Transactions",
      icon: Users,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.subtext}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
