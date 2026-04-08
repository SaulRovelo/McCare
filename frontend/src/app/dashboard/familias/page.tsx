
"use client"

import { useState } from "react"
import {
    Users,
    Search,
    Plus,
    Home,
    Baby,
    Heart,
    Clock,
    AlertCircle,
    Phone,
    Mail,
    MoreHorizontal,
    Filter,
    Car,
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

type NeedPriority = "urgent" | "important" | "normal"

interface FamilyNeed {
    id: string
    description: string
    priority: NeedPriority
    time?: string
}

interface Family {
    id: string
    name: string
    members: number
    children: number
    room: string
    checkInDate: string
    stayDuration: string
    hospital: string
    childPatient: string
    childAge: string
    needs: FamilyNeed[]
    contactPhone: string
    contactEmail: string
    notes?: string
}

const familiesData: Family[] = [
    {
        id: "1",
        name: "Martinez Family",
        members: 4,
        children: 2,
        room: "204",
        checkInDate: "March 28, 2026",
        stayDuration: "7 days",
        hospital: "Children&apos;s Hospital",
        childPatient: "Sofia",
        childAge: "5 years",
        needs: [
            {
                id: "n1",
                description: "Transport to hospital at 10 AM",
                priority: "urgent",
                time: "10:00 AM",
            },
            {
                id: "n2",
                description: "Spanish language support needed",
                priority: "important",
            },
        ],
        contactPhone: "(555) 123-4567",
        contactEmail: "martinez.fam@email.com",
        notes: "Dad works remotely during day",
    },
    {
        id: "2",
        name: "Thompson Family",
        members: 3,
        children: 1,
        room: "108",
        checkInDate: "March 21, 2026",
        stayDuration: "14 days",
        hospital: "St. Mary&apos;s Medical",
        childPatient: "James",
        childAge: "8 years",
        needs: [
            {
                id: "n3",
                description: "Gluten-free meal requirements",
                priority: "important",
            },
        ],
        contactPhone: "(555) 234-5678",
        contactEmail: "thompson.j@email.com",
        notes: "Checking out tomorrow",
    },
    {
        id: "3",
        name: "Chen Family",
        members: 5,
        children: 3,
        room: "302",
        checkInDate: "April 1, 2026",
        stayDuration: "3 days",
        hospital: "Children&apos;s Hospital",
        childPatient: "Lily",
        childAge: "3 years",
        needs: [
            {
                id: "n4",
                description: "Requires special baby formula (hypoallergenic)",
                priority: "urgent",
            },
            {
                id: "n5",
                description: "Extra crib needed for infant sibling",
                priority: "important",
            },
            {
                id: "n6",
                description: "Mandarin interpreter for medical appointments",
                priority: "normal",
            },
        ],
        contactPhone: "(555) 345-6789",
        contactEmail: "chen.family@email.com",
    },
    {
        id: "4",
        name: "Williams Family",
        members: 2,
        children: 1,
        room: "115",
        checkInDate: "March 15, 2026",
        stayDuration: "20 days",
        hospital: "University Medical Center",
        childPatient: "Emma",
        childAge: "12 years",
        needs: [
            {
                id: "n7",
                description: "Quiet room preferred (child sensitive to noise)",
                priority: "normal",
            },
        ],
        contactPhone: "(555) 456-7890",
        contactEmail: "williams.e@email.com",
        notes: "Child was discharged, departing tomorrow",
    },
    {
        id: "5",
        name: "Anderson Family",
        members: 3,
        children: 1,
        room: "201",
        checkInDate: "April 2, 2026",
        stayDuration: "2 days",
        hospital: "Children&apos;s Hospital",
        childPatient: "Noah",
        childAge: "6 years",
        needs: [
            {
                id: "n8",
                description: "Wheelchair accessible transport needed",
                priority: "urgent",
                time: "2:00 PM",
            },
            {
                id: "n9",
                description: "Dietary restrictions: Vegetarian",
                priority: "normal",
            },
        ],
        contactPhone: "(555) 567-8901",
        contactEmail: "anderson.fam@email.com",
    },
    {
        id: "6",
        name: "Garcia Family",
        members: 4,
        children: 2,
        room: "310",
        checkInDate: "April 3, 2026",
        stayDuration: "1 day",
        hospital: "St. Mary&apos;s Medical",
        childPatient: "Miguel",
        childAge: "10 years",
        needs: [],
        contactPhone: "(555) 678-9012",
        contactEmail: "garcia.m@email.com",
        notes: "First-time stay, orientation completed",
    },
]

function getNeedBadge(priority: NeedPriority) {
    switch (priority) {
        case "urgent":
            return (
                <Badge className="bg-[#DB0007]/10 text-[#DB0007] hover:bg-[#DB0007]/10 border border-[#DB0007]/30 text-xs">
                    Urgent
                </Badge>
            )
        case "important":
            return (
                <Badge className="bg-[#FFBC0D]/20 text-[#9A7500] hover:bg-[#FFBC0D]/20 border border-[#FFBC0D]/40 text-xs">
                    Important
                </Badge>
            )
        case "normal":
            return (
                <Badge variant="secondary" className="text-xs">
                    Normal
                </Badge>
            )
    }
}

export default function FamiliesPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredFamilies = familiesData.filter((family) =>
        family.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const stats = {
        totalFamilies: familiesData.length,
        totalMembers: familiesData.reduce((sum, f) => sum + f.members, 0),
        urgentNeeds: familiesData.flatMap((f) => f.needs).filter((n) => n.priority === "urgent")
            .length,
        roomsOccupied: familiesData.length,
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Families</h1>
                    <Button className="bg-[#DB0007] hover:bg-[#DB0007]/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Register Family
                    </Button>
                </div>
                <p className="text-muted-foreground">
                    Manage families currently staying at the Ronald McDonald House.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Families Staying</p>
                                <p className="text-2xl font-bold">{stats.totalFamilies}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-[#DB0007]/10 flex items-center justify-center">
                                <Home className="h-5 w-5 text-[#DB0007]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Guests</p>
                                <p className="text-2xl font-bold">{stats.totalMembers}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Urgent Needs</p>
                                <p className="text-2xl font-bold text-[#DB0007]">{stats.urgentNeeds}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-[#FFBC0D]/20 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-[#FFBC0D]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Rooms Occupied</p>
                                <p className="text-2xl font-bold">{stats.roomsOccupied}/24</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Home className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search families..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>All Families</DropdownMenuItem>
                        <DropdownMenuItem>Has Urgent Needs</DropdownMenuItem>
                        <DropdownMenuItem>New Check-ins (Today)</DropdownMenuItem>
                        <DropdownMenuItem>Checking Out Soon</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Families Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredFamilies.map((family) => (
                    <Card
                        key={family.id}
                        className="shadow-sm border-border/50 hover:shadow-md transition-shadow"
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-11 w-11 border-2 border-[#DB0007]/20">
                                        <AvatarFallback className="bg-[#DB0007]/10 text-[#DB0007] font-semibold">
                                            {family.name
                                                .split(" ")[0]
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base">{family.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-1.5">
                                            <Home className="h-3 w-3" />
                                            Room {family.room}
                                        </CardDescription>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem>Edit Information</DropdownMenuItem>
                                        <DropdownMenuItem>Add Need</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-[#DB0007]">
                                            Process Check-Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Family Info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{family.members} members</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Baby className="h-4 w-4 text-muted-foreground" />
                                    <span>{family.children} children</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{family.stayDuration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-[#DB0007]" />
                                    <span className="truncate">{family.childPatient}, {family.childAge}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Needs Summary */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    Needs Summary
                                </p>
                                {family.needs.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">
                                        No special needs recorded
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {family.needs.slice(0, 2).map((need) => (
                                            <div
                                                key={need.id}
                                                className="flex items-start gap-2 text-sm"
                                            >
                                                {need.priority === "urgent" && need.time ? (
                                                    <Car className="h-4 w-4 text-[#DB0007] shrink-0 mt-0.5" />
                                                ) : (
                                                    <AlertCircle
                                                        className={`h-4 w-4 shrink-0 mt-0.5 ${need.priority === "urgent"
                                                                ? "text-[#DB0007]"
                                                                : need.priority === "important"
                                                                    ? "text-[#FFBC0D]"
                                                                    : "text-muted-foreground"
                                                            }`}
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="leading-tight">{need.description}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getNeedBadge(need.priority)}
                                                        {need.time && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {need.time}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {family.needs.length > 2 && (
                                            <p className="text-xs text-muted-foreground">
                                                +{family.needs.length - 2} more needs
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Contact */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Mail className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button variant="outline" size="sm">
                                    View Profile
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredFamilies.length === 0 && (
                <Card className="shadow-sm border-border/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">No Families Found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            No families match your search criteria. Try adjusting your search
                            or register a new family.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
