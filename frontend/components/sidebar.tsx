import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ClipboardCheck,
  BookOpen,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/router"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: GraduationCap, label: "Students", href: "/students" },
  { icon: Users, label: "Teachers", href: "/teachers" },
  { icon: ClipboardCheck, label: "Attendance", href: "/attendance" },
  { icon: BookOpen, label: "Courses", href: "/courses" },
  { icon: FileText, label: "Exam", href: "/exam" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: BarChart3, label: "Reports", href: "/reports" }, // Added Reports menu item
]

export function Sidebar() {
  const router = useRouter()
  const pathname = router.pathname

  return (
    <aside className="w-60 bg-slate-700 text-white flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-3">
          <div className="flex gap-1">
            <div className="w-2 h-6 bg-cyan-400 rounded-sm" />
            <div className="w-2 h-6 bg-yellow-400 rounded-sm" />
            <div className="w-2 h-6 bg-rose-400 rounded-sm" />
          </div>
          <span className="font-bold text-lg">SCHOOL</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                isActive ? "bg-white text-slate-700 font-medium" : "text-slate-300 hover:bg-slate-600",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 space-y-1 border-t border-slate-600">
        <Link
          href="/settings"
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
            pathname === "/settings" ? "bg-white text-slate-700 font-medium" : "text-slate-300 hover:bg-slate-600",
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <Link
          href="/logout"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-600 transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  )
}
