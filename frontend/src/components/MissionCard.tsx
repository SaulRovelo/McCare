"use client"

import { Heart, Zap, Package, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type UrgencyLevel = "high" | "medium" | "low"

export interface Mission {
  id: string
  title: string
  description: string
  icon: "heart" | "zap" | "package"
  urgency: UrgencyLevel
  currentInventory: number
  targetInventory: number
  donationAmount: string
  diasCubiertos?: number
  category: string
  location: string
}

interface MissionCardProps {
  title: string
  description: string
  icon: "heart" | "zap" | "package"
  urgency: UrgencyLevel
  currentInventory: number
  targetInventory: number
  donationAmount: string
  diasCubiertos?: number
  category: string
  onDonate?: () => void
}

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  zap: Zap,
  package: Package,
}

const urgencyConfig: Record<UrgencyLevel, { label: string; className: string }> = {
  high: {
    label: "Alta",
    className: "bg-primary text-primary-foreground border-transparent",
  },
  medium: {
    label: "Media",
    className: "bg-accent text-accent-foreground border-transparent",
  },
  low: {
    label: "Baja",
    className: "bg-secondary text-secondary-foreground border-secondary-foreground/20",
  },
}

export function MissionCard({
  title,
  description,
  icon,
  urgency,
  currentInventory,
  targetInventory,
  donationAmount,
  diasCubiertos,
  category,
  onDonate,
}: MissionCardProps) {
  const Icon = iconMap[icon]
  const progress = Math.round((currentInventory / targetInventory) * 100)
  const urgencyStyle = urgencyConfig[urgency]

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      {/* Urgency indicator bar */}
      {urgency === "high" && (
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
      )}
      {urgency === "medium" && (
        <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
            <Icon className={cn(
              "size-6",
              urgency === "high" ? "text-primary" : urgency === "medium" ? "text-accent-foreground" : "text-muted-foreground"
            )} />
          </div>
          <Badge className={cn("font-medium", urgencyStyle.className)}>
            Urgencia {urgencyStyle.label}
          </Badge>
        </div>
        <div className="mt-4 space-y-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {category}
          </span>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Inventory Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Nivel de inventario</span>
            <span className="font-medium text-foreground">
              {currentInventory} / {targetInventory}
            </span>
          </div>
          <Progress 
            value={progress} 
            className={cn(
              "h-2",
              urgency === "high" && "[&>[data-slot=progress-indicator]]:bg-primary",
              urgency === "medium" && "[&>[data-slot=progress-indicator]]:bg-accent",
              urgency === "low" && "[&>[data-slot=progress-indicator]]:bg-muted-foreground"
            )}
          />
          <p className="text-xs text-muted-foreground">
            {urgency === "high" 
              ? "Nivel crítico — se necesitan donaciones urgentes" 
              : urgency === "medium" 
                ? "Stock bajo — se aceptan donaciones"
                : "Buen nivel — gracias por tu apoyo"
            }
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-6">
        <div>
          <span className="text-2xl font-bold text-foreground">{donationAmount}</span>
          <span className="ml-1 text-sm text-muted-foreground">
            {diasCubiertos ? `cubre ~${diasCubiertos} días` : "sugerido"}
          </span>
        </div>
        <Button 
          onClick={onDonate}
          className={cn(
            "gap-2",
            urgency === "high" && "bg-primary hover:bg-primary/90",
            urgency === "medium" && "bg-accent text-accent-foreground hover:bg-accent/90",
            urgency === "low" && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <Heart className="size-4" />
          Donar
        </Button>
      </CardFooter>
    </Card>
  )
}
