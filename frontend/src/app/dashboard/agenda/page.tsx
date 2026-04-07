"use client"

import { useState } from "react"
import {
  Calendar as CalendarIcon,
  Truck,
  Users,
  Home,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type EventType = "delivery" | "volunteer" | "checkin" | "checkout"

interface ScheduleEvent {
  id: string
  title: string
  type: EventType
  time: string
  duration: string
  location?: string
  details?: string
  assignee?: string
}

const scheduleData: Record<string, ScheduleEvent[]> = {
  "2026-04-04": [
    {
      id: "1",
      title: "Entrega de Suministros para Bebés",
      type: "delivery",
      time: "09:00 AM",
      duration: "1 hora",
      location: "Muelle de Carga A",
      details: "Pañales, fórmula, biberones de donaciones de Amazon",
    },
    {
      id: "2",
      title: "Turno Matutino de Voluntarios",
      type: "volunteer",
      time: "10:00 AM",
      duration: "4 horas",
      assignee: "Sarah M., John D., Emily R.",
      details: "Recepción y asistencia en cocina",
    },
    {
      id: "3",
      title: "Ingreso Familia Martínez",
      type: "checkin",
      time: "02:00 PM",
      duration: "30 min",
      location: "Habitación 204",
      details: "Familia de 4, niño en Hospital Infantil",
    },
    {
      id: "4",
      title: "Salida Familia Thompson",
      type: "checkout",
      time: "11:00 AM",
      duration: "30 min",
      location: "Habitación 108",
      details: "Completando estancia de 2 semanas",
    },
    {
      id: "5",
      title: "Turno Vespertino de Voluntarios",
      type: "volunteer",
      time: "02:00 PM",
      duration: "4 horas",
      assignee: "Mike T., Lisa K.",
      details: "Supervisión de sala de actividades",
    },
    {
      id: "6",
      title: "Entrega de Suministros Médicos",
      type: "delivery",
      time: "03:30 PM",
      duration: "45 min",
      location: "Muelle de Carga B",
      details: "Botiquines de primeros auxilios y suministros médicos de farmacia aliada",
    },
  ],
  "2026-04-05": [
    {
      id: "7",
      title: "Reabastecimiento de Despensa",
      type: "delivery",
      time: "08:00 AM",
      duration: "2 horas",
      location: "Almacén de Cocina",
      details: "Entrega semanal del banco de alimentos",
    },
    {
      id: "8",
      title: "Ingreso Familia Chen",
      type: "checkin",
      time: "10:30 AM",
      duration: "30 min",
      location: "Habitación 302",
      details: "Familia de 3, se espera estancia a largo plazo",
    },
    {
      id: "9",
      title: "Equipo de Voluntarios Fin de Semana",
      type: "volunteer",
      time: "09:00 AM",
      duration: "6 horas",
      assignee: "Grupo Corporativo - Acme Inc.",
      details: "Limpieza profunda y mantenimiento",
    },
  ],
  "2026-04-06": [
    {
      id: "10",
      title: "Salida Familia Williams",
      type: "checkout",
      time: "09:00 AM",
      duration: "30 min",
      location: "Habitación 115",
      details: "Niño dado de alta, regresan a casa",
    },
    {
      id: "11",
      title: "Entrega de Ropa de Cama",
      type: "delivery",
      time: "11:00 AM",
      duration: "1 hora",
      location: "Lavandería",
      details: "Ropa de cama limpia del servicio de lavandería",
    },
  ],
}

function getEventColor(type: EventType) {
  switch (type) {
    case "delivery":
      return {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        badge: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      }
    case "volunteer":
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        badge: "bg-green-100 text-green-700 hover:bg-green-100",
      }
    case "checkin":
      return {
        bg: "bg-[#FFBC0D]/20",
        text: "text-[#FFBC0D]",
        border: "border-[#FFBC0D]/30",
        badge: "bg-[#FFBC0D]/20 text-[#9A7500] hover:bg-[#FFBC0D]/20",
      }
    case "checkout":
      return {
        bg: "bg-[#DB0007]/10",
        text: "text-[#DB0007]",
        border: "border-[#DB0007]/20",
        badge: "bg-[#DB0007]/10 text-[#DB0007] hover:bg-[#DB0007]/10",
      }
  }
}

function getEventIcon(type: EventType) {
  switch (type) {
    case "delivery": return Truck
    case "volunteer": return Users
    case "checkin": return Home
    case "checkout": return Home
  }
}

function getEventLabel(type: EventType) {
  switch (type) {
    case "delivery": return "Entrega"
    case "volunteer": return "Voluntariado"
    case "checkin": return "Ingreso"
    case "checkout": return "Salida"
  }
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 3, 4))
  const dateKey = formatDate(selectedDate)
  const events = scheduleData[dateKey] || []

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const eventCounts = {
    delivery: events.filter((e) => e.type === "delivery").length,
    volunteer: events.filter((e) => e.type === "volunteer").length,
    checkin: events.filter((e) => e.type === "checkin").length,
    checkout: events.filter((e) => e.type === "checkout").length,
  }

  const datesWithEvents = Object.keys(scheduleData).map((d) => new Date(d))

  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <Button className="bg-[#DB0007] hover:bg-[#DB0007]/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Evento
          </Button>
        </div>
        <p className="text-muted-foreground">
          Gestiona entregas, turnos de voluntarios e ingresos/salidas de familias.
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entregas Hoy</p>
                <p className="text-2xl font-bold text-blue-600">{eventCounts.delivery}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Turnos Voluntarios</p>
                <p className="text-2xl font-bold text-green-600">{eventCounts.volunteer}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos</p>
                <p className="text-2xl font-bold text-[#FFBC0D]">{eventCounts.checkin}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#FFBC0D]/20 flex items-center justify-center">
                <Home className="h-5 w-5 text-[#FFBC0D]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Salidas</p>
                <p className="text-2xl font-bold text-[#DB0007]">{eventCounts.checkout}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#DB0007]/10 flex items-center justify-center">
                <Home className="h-5 w-5 text-[#DB0007]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendario */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Seleccionar Fecha</CardTitle>
            <CardDescription>Ver eventos para cualquier día</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex justify-center pb-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={{ hasEvents: datesWithEvents }}
              modifiersStyles={{
                hasEvents: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                  textDecorationColor: "#DB0007",
                },
              }}
              className="rounded-md"
            />
          </CardContent>
          <Separator />
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Leyenda</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-xs">Entrega</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-xs">Voluntario</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#FFBC0D]" />
                  <span className="text-xs">Ingreso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#DB0007]" />
                  <span className="text-xs">Salida</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agenda Diaria */}
        <Card className="shadow-sm border-border/50 lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPreviousDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle className="capitalize">{formatDisplayDate(selectedDate)}</CardTitle>
                  <CardDescription>
                    {events.length} evento{events.length !== 1 ? "s" : ""} programado{events.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date(2026, 3, 4))}>
                Hoy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Sin Eventos Programados</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  No hay eventos programados para este día. Selecciona otra fecha o añade un nuevo evento.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {events
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((event) => {
                    const colors = getEventColor(event.type)
                    const Icon = getEventIcon(event.type)
                    return (
                      <div key={event.id} className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80`}>
                              <Icon className={`h-4 w-4 ${colors.text}`} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{event.title}</h4>
                                <Badge className={colors.badge}>
                                  {getEventLabel(event.type)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {event.time} ({event.duration})
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                              {event.details && (
                                <p className="text-sm text-muted-foreground">{event.details}</p>
                              )}
                              {event.assignee && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Asignado: </span>
                                  <span className="font-medium">{event.assignee}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Detalles
                          </Button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
