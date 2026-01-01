import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function CommunityCard() {
  return (
    <Card className="bg-slate-700 border-0 text-white overflow-hidden">
      <CardContent className="p-6 relative">
        <div className="relative z-10">
          <h3 className="text-lg font-semibold mb-6">Join the community and find out more...</h3>
          <Button className="bg-white text-slate-700 hover:bg-slate-100 font-medium">Explore now</Button>
        </div>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full border-8 border-yellow-400 opacity-20" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-cyan-400 opacity-30" />
      </CardContent>
    </Card>
  )
}
