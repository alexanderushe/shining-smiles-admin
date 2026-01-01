
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoreHorizontal, MapPin } from "lucide-react"
import { StudentProgressChart } from "./student-progress-chart"

export function StudentProfile() {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-slate-700 text-white overflow-hidden relative">
        <CardContent className="p-8">
          <div className="flex items-center gap-6 relative z-10">
            <Avatar className="h-24 w-24 border-4 border-white/20">
              <AvatarImage src="/student-woman-portrait.jpg" alt="Trisha Berge" />
              <AvatarFallback>TB</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold mb-1">Trisha Berge</h2>
              <div className="flex items-center gap-3">
                <p className="text-slate-300">Class VI | Students ID : F-6522</p>
                <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 rounded-md text-cyan-200 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>Main Campus</span>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-yellow-500/20" />
          <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-cyan-500/30" />
        </CardContent>
      </Card>

      {/* Basic Details Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Basic Details</h3>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Gender</p>
              <p className="font-medium">Female</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
              <p className="font-medium">29-04-2004</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Religion</p>
              <p className="font-medium">Christian</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Blood Group</p>
              <p className="font-medium">B+</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Address</p>
              <p className="font-medium">1962 Harrison Street San Francisco, CA 94103</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Father</p>
              <p className="font-medium">Richard Berge</p>
              <p className="text-sm text-muted-foreground">+1603-965-4668</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mother</p>
              <p className="font-medium">Maren Berge</p>
              <p className="text-sm text-muted-foreground">+1660-687-7027</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0">
          <TabsTrigger
            value="progress"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Progress
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Attendance
          </TabsTrigger>
          <TabsTrigger
            value="fees"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Fees History
          </TabsTrigger>
          <TabsTrigger
            value="bus"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            School Bus
          </TabsTrigger>
        </TabsList>
        <TabsContent value="progress" className="mt-6">
          <StudentProgressChart />
        </TabsContent>
        <TabsContent value="attendance" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Attendance data will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="fees" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Fees history will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bus" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">School bus information will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
