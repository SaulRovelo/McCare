import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SustainabilityScore } from "@/components/dashboard/SustainabilityScore"
import { TaxDocuments } from "@/components/dashboard/TaxDocuments"
import { MissionEvidence } from "@/components/dashboard/MissionEvidence"
import { CurrentProjects } from "@/components/dashboard/CurrentProjects"
import { ImpactReports } from "@/components/dashboard/ImpactReports"
import {
  Building2,
  Shield,
  FileCheck,
  BarChart3,
  Calendar,
  Download,
  Mail,
} from "lucide-react"

export default function AliadosPage() {
  return (
    <div className="space-y-8">
      {/* Encabezado de Página */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#DB0007] to-[#DB0007]/80 shadow-sm">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Portal de Aliados Corporativos
              </h1>
              <p className="text-sm text-muted-foreground">
                Panel de transparencia empresarial para cumplimiento IFRS/ESG
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Mail className="h-4 w-4" />
            Contactar Gerente
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Exportar Datos
          </Button>
        </div>
      </div>

      {/* Tarjeta de Información del Aliado */}
      <Card className="shadow-sm border-border/50 bg-gradient-to-r from-muted/30 to-muted/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-white shadow-sm border border-border/50 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">AC</span>
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Acme Corporation</h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    Socio Platino
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Miembro desde 2019
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">485,000 MXN</p>
                <p className="text-xs text-muted-foreground">Contribuciones Totales</p>
              </div>
              <div className="h-12 w-px bg-border/50" />
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">1,247</p>
                <p className="text-xs text-muted-foreground">Familias Impactadas</p>
              </div>
              <div className="h-12 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-500/30 bg-green-50 text-green-700">
                  <FileCheck className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas Principales */}
      <Tabs defaultValue="proyectos" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-11">
          <TabsTrigger value="proyectos" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Proyectos Actuales
          </TabsTrigger>
          <TabsTrigger value="reportes" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Reportes de Impacto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proyectos" className="space-y-6">
          <CurrentProjects />
        </TabsContent>

        <TabsContent value="reportes" className="space-y-6">
          <ImpactReports />
        </TabsContent>
      </Tabs>

      {/* Grid Inferior: Sostenibilidad + Documentos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SustainabilityScore />
        <TaxDocuments />
      </div>

      <MissionEvidence />

      {/* Pie de Cumplimiento */}
      <Card className="shadow-sm border-border/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Cumplimiento IFRS S1/S2
              </span>
              <span className="flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5" />
                Alineado al Marco ESG
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Deducibilidad Verificada
              </span>
            </div>
            <span>Última auditoría: 15 de Marzo, 2026</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
