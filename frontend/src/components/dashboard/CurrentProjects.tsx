"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
  MapPin,
} from "lucide-react"

interface Project {
  id: string
  name: string
  location: string
  description: string
  status: "active" | "pending" | "completed"
  progress: number
  fundingGoal: number
  fundingRaised: number
  beneficiaries: number
  startDate: string
  endDate: string
}

const projects: Project[] = [
  {
    id: "1",
    name: "Winter Comfort Initiative",
    location: "Chicago, IL",
    description: "Providing heating supplies and warm clothing for families during winter months.",
    status: "active",
    progress: 72,
    fundingGoal: 150000,
    fundingRaised: 108000,
    beneficiaries: 340,
    startDate: "Nov 2025",
    endDate: "Mar 2026",
  },
  {
    id: "2",
    name: "Family Nutrition Program",
    location: "Multiple Locations",
    description: "Ensuring families have access to nutritious meals during their stay.",
    status: "active",
    progress: 85,
    fundingGoal: 200000,
    fundingRaised: 170000,
    beneficiaries: 520,
    startDate: "Jan 2026",
    endDate: "Dec 2026",
  },
  {
    id: "3",
    name: "Medical Transport Fund",
    location: "Houston, TX",
    description: "Transportation assistance for families traveling to medical appointments.",
    status: "active",
    progress: 45,
    fundingGoal: 75000,
    fundingRaised: 33750,
    beneficiaries: 180,
    startDate: "Feb 2026",
    endDate: "Aug 2026",
  },
  {
    id: "4",
    name: "Sibling Support Services",
    location: "New York, NY",
    description: "Educational and emotional support programs for siblings of hospitalized children.",
    status: "pending",
    progress: 15,
    fundingGoal: 100000,
    fundingRaised: 15000,
    beneficiaries: 250,
    startDate: "Apr 2026",
    endDate: "Dec 2026",
  },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function CurrentProjects() {
  const activeProjects = projects.filter((p) => p.status === "active").length
  const totalFunding = projects.reduce((acc, p) => acc + p.fundingRaised, 0)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DB0007]/10">
                <Target className="h-5 w-5 text-[#DB0007]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFBC0D]/20">
                <DollarSign className="h-5 w-5 text-[#FFBC0D]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalFunding)}</p>
                <p className="text-xs text-muted-foreground">Total Contributed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {projects.reduce((acc, p) => acc + p.beneficiaries, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Beneficiaries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Cards */}
      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="shadow-sm border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <Badge
                        variant={project.status === "active" ? "outline" : "secondary"}
                        className={
                          project.status === "active"
                            ? "border-green-500/30 bg-green-50 text-green-700 text-[10px] px-1.5"
                            : "bg-amber-50 text-amber-700 border-amber-500/30 text-[10px] px-1.5"
                        }
                      >
                        {project.status === "active" ? "Active" : "Pending"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {project.startDate} - {project.endDate}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-medium">
                        {formatCurrency(project.fundingRaised)} of {formatCurrency(project.fundingGoal)}
                      </span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {project.beneficiaries} beneficiaries
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{project.progress}% complete</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="gap-1.5">
                  View Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
