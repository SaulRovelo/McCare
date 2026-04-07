"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, TrendingUp, Award, CheckCircle2 } from "lucide-react"

interface ScoreCategory {
  name: string
  score: number
  maxScore: number
  trend: "up" | "stable" | "down"
}

const categories: ScoreCategory[] = [
  { name: "Environmental Impact", score: 87, maxScore: 100, trend: "up" },
  { name: "Social Responsibility", score: 92, maxScore: 100, trend: "up" },
  { name: "Governance & Ethics", score: 85, maxScore: 100, trend: "stable" },
  { name: "Community Engagement", score: 94, maxScore: 100, trend: "up" },
]

const esgMetrics = [
  { label: "Carbon Offset", value: "2.4 tons", icon: Leaf },
  { label: "SDG Alignment", value: "Goals 1, 3, 11", icon: Award },
  { label: "IFRS Compliant", value: "Verified", icon: CheckCircle2 },
]

export function SustainabilityScore() {
  const overallScore = Math.round(
    categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length
  )

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">ESG Sustainability Score</CardTitle>
            <CardDescription className="text-sm mt-1">
              IFRS S1/S2 compliant sustainability metrics
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-medium border-green-500/30 bg-green-50 text-green-700">
            Q1 2026 Report
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score Circle */}
        <div className="flex items-center gap-8">
          <div className="relative flex items-center justify-center">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(overallScore / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                className="text-green-600 transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">{overallScore}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">+5 pts from last quarter</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your organization ranks in the top 15% of corporate partners for sustainability impact.
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Score Breakdown</h4>
          {categories.map((category) => (
            <div key={category.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{category.name}</span>
                <span className="font-medium tabular-nums">{category.score}/{category.maxScore}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ESG Quick Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
          {esgMetrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="flex justify-center mb-1.5">
                <metric.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
