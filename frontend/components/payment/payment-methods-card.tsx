
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Wallet, Building2, Smartphone } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const paymentMethods = [
  {
    name: "Credit Card",
    percentage: 45,
    amount: "$56,061",
    icon: CreditCard,
    color: "bg-blue-500",
  },
  {
    name: "Bank Transfer",
    percentage: 30,
    amount: "$37,374",
    icon: Building2,
    color: "bg-emerald-500",
  },
  {
    name: "Digital Wallet",
    percentage: 20,
    amount: "$24,916",
    icon: Wallet,
    color: "bg-purple-500",
  },
  {
    name: "Mobile Payment",
    percentage: 5,
    amount: "$6,229",
    icon: Smartphone,
    color: "bg-amber-500",
  },
]

export function PaymentMethodsCard() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800">Payment Methods</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          return (
            <div key={method.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${method.color} bg-opacity-10`}>
                    <Icon className={`w-4 h-4 ${method.color.replace("bg-", "text-")}`} />
                  </div>
                  <span className="text-slate-700 font-medium">{method.name}</span>
                </div>
                <span className="text-slate-500">{method.percentage}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={method.percentage} className="flex-1" />
                <span className="text-sm font-semibold text-slate-800 min-w-[70px] text-right">{method.amount}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
