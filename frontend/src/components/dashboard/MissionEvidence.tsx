"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Camera, 
  BarChart3, 
  Users, 
  Heart, 
  Home, 
  TrendingUp,
  CheckCircle2,
  MapPin
} from "lucide-react"

interface MissionEvidence {
  id: string
  title: string
  location: string
  date: string
  status: "completed" | "ongoing"
  photos: { url: string; caption: string }[]
  metrics: { label: string; value: string; change?: string }[]
  beneficiaries: number
  summary: string
}

const missionEvidence: MissionEvidence[] = [
  {
    id: "1",
    title: "Family Support Program - Chicago House",
    location: "Chicago, IL",
    date: "Q1 2026",
    status: "completed",
    photos: [
      { url: "/placeholder.svg?height=120&width=180", caption: "Family welcome event" },
      { url: "/placeholder.svg?height=120&width=180", caption: "Donated supplies distribution" },
      { url: "/placeholder.svg?height=120&width=180", caption: "Community gathering" },
    ],
    metrics: [
      { label: "Families Supported", value: "127", change: "+23%" },
      { label: "Nights Provided", value: "3,810", change: "+18%" },
      { label: "Meals Served", value: "11,430", change: "+15%" },
      { label: "Cost Savings for Families", value: "571,500 MXN", change: "+21%" },
    ],
    beneficiaries: 127,
    summary: "This quarter, your contribution directly supported 127 families staying at the Chicago Ronald McDonald House, providing comfort during their children's medical treatments."
  },
  {
    id: "2",
    title: "Medical Supply Initiative - Houston House",
    location: "Houston, TX",
    date: "Q1 2026",
    status: "completed",
    photos: [
      { url: "/placeholder.svg?height=120&width=180", caption: "Supply room renovation" },
      { url: "/placeholder.svg?height=120&width=180", caption: "Medical supplies delivered" },
    ],
    metrics: [
      { label: "Supplies Distributed", value: "2,450", change: "+31%" },
      { label: "Families Reached", value: "89" },
      { label: "Volunteer Hours", value: "156" },
    ],
    beneficiaries: 89,
    summary: "Medical supplies funded by your organization reached 89 families, ensuring children had access to essential care items during their hospital stays."
  },
  {
    id: "3",
    title: "Nutrition Program Expansion - NYC House",
    location: "New York, NY",
    date: "Ongoing",
    status: "ongoing",
    photos: [
      { url: "/placeholder.svg?height=120&width=180", caption: "Kitchen renovation progress" },
    ],
    metrics: [
      { label: "Project Progress", value: "68%" },
      { label: "Projected Capacity", value: "+40%" },
      { label: "Est. Completion", value: "May 2026" },
    ],
    beneficiaries: 200,
    summary: "Your investment in the NYC kitchen expansion will increase meal capacity by 40%, serving an estimated 200+ additional families monthly upon completion."
  },
]

export function MissionEvidence() {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Mission Evidence</CardTitle>
            <CardDescription className="text-sm mt-1">
              Verified impact documentation with photos and metrics
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            {missionEvidence.length} Active Projects
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {missionEvidence.map((mission) => (
            <AccordionItem key={mission.id} value={mission.id} className="border-border/50">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                    <Home className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{mission.title}</span>
                      <Badge
                        variant={mission.status === "completed" ? "outline" : "secondary"}
                        className={
                          mission.status === "completed"
                            ? "border-green-500/30 bg-green-50 text-green-700 text-[10px] px-1.5"
                            : "bg-blue-50 text-blue-700 border-blue-500/30 text-[10px] px-1.5"
                        }
                      >
                        {mission.status === "completed" ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {mission.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {mission.beneficiaries} beneficiaries
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-6 pl-14">
                  {/* Summary */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mission.summary}
                  </p>

                  {/* Photo Evidence */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      Photo Evidence
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {mission.photos.map((photo, index) => (
                        <div key={index} className="flex-shrink-0 space-y-1.5">
                          <div className="h-24 w-36 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden">
                            <div className="text-xs text-muted-foreground text-center px-2">
                              [Photo: {photo.caption}]
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground max-w-[144px] truncate">
                            {photo.caption}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      Success Metrics
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {mission.metrics.map((metric, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1"
                        >
                          <p className="text-xs text-muted-foreground">{metric.label}</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-semibold text-foreground">
                              {metric.value}
                            </span>
                            {metric.change && (
                              <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                                <TrendingUp className="h-3 w-3" />
                                {metric.change}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification */}
                  <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span>
                      Verified by McCare Impact Assessment Team on {mission.date}
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
