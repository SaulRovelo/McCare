"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  Users,
  Heart,
  Home,
  DollarSign,
  Download,
  Calendar,
  ArrowUpRight,
} from "lucide-react"

interface ImpactMetric {
  label: string
  value: string
  change: string
  trend: "up" | "down" | "stable"
  icon: typeof Heart
}

interface QuarterlyReport {
  id: string
  period: string
  status: "published" | "draft"
  familiesHelped: number
  totalDonations: string
  highlights: string[]
}

const impactMetrics: ImpactMetric[] = [
  {
    label: "Families Supported",
    value: "1,247",
    change: "+18%",
    trend: "up",
    icon: Users,
  },
  {
    label: "Nights Provided",
    value: "37,410",
    change: "+22%",
    trend: "up",
    icon: Home,
  },
  {
    label: "Meals Served",
    value: "112,230",
    change: "+15%",
    trend: "up",
    icon: Heart,
  },
  {
    label: "Family Savings",
    value: "$3.7M",
    change: "+24%",
    trend: "up",
    icon: DollarSign,
  },
]

const quarterlyReports: QuarterlyReport[] = [
  {
    id: "1",
    period: "Q1 2026",
    status: "published",
    familiesHelped: 312,
    totalDonations: "$125,000",
    highlights: [
      "Expanded family nutrition program to 3 new locations",
      "Launched sibling support initiative",
      "Achieved 98% family satisfaction rating",
    ],
  },
  {
    id: "2",
    period: "Q4 2025",
    status: "published",
    familiesHelped: 298,
    totalDonations: "$118,000",
    highlights: [
      "Holiday care package distribution to 500+ families",
      "Completed kitchen renovation at Chicago House",
      "Partnership with 12 new corporate sponsors",
    ],
  },
  {
    id: "3",
    period: "Q3 2025",
    status: "published",
    familiesHelped: 285,
    totalDonations: "$105,000",
    highlights: [
      "Back-to-school program for 150 children",
      "Medical transport fund exceeded targets",
      "Volunteer engagement up 35%",
    ],
  },
]

export function ImpactReports() {
  return (
    <div className="space-y-6">
      {/* Annual Impact Overview */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Annual Impact Overview</CardTitle>
              <CardDescription className="text-sm mt-1">
                Your organization&apos;s cumulative impact through McCare
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-medium">
              FY 2025-2026
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactMetrics.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      {metric.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Impact Visualization */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold">Monthly Impact Trend</h4>
              <Button variant="ghost" size="sm" className="text-xs h-8 gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                View Full Analytics
              </Button>
            </div>
            {/* Simulated Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-32 px-2">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                (month, index) => {
                  const heights = [45, 52, 58, 65, 72, 68, 75, 82, 78, 85, 90, 95]
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-[#DB0007] to-[#DB0007]/70 rounded-t transition-all duration-300 hover:opacity-80"
                        style={{ height: `${heights[index]}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{month}</span>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Reports */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Quarterly Impact Reports</CardTitle>
              <CardDescription className="text-sm mt-1">
                Detailed reports for stakeholder review and compliance
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quarterlyReports.map((report) => (
              <div
                key={report.id}
                className="rounded-lg border border-border/50 bg-muted/10 p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{report.period} Impact Report</h4>
                      <Badge
                        variant="outline"
                        className="border-green-500/30 bg-green-50 text-green-700 text-[10px] px-1.5"
                      >
                        Published
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {report.familiesHelped} families helped
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {report.totalDonations} contributed
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                      Preview
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                      <Download className="h-3 w-3" />
                      PDF
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Key Highlights
                  </p>
                  <ul className="space-y-1">
                    {report.highlights.map((highlight, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-[#DB0007] mt-1.5">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
