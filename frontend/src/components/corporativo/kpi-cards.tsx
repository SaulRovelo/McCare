import { Briefcase, HeartHandshake, Clock, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function KpiCards({ data }: { data?: any }) {
  const kpis = [
    { 
      id: "inversion", 
      label: "Inversión Social Acumulada", 
      value: `${(data?.inversion_social_acumulada || 0).toLocaleString()}`, 
      unit: "MXN", 
      change: "Fondo de donativos directos", 
      icon: Briefcase, iconBg: "bg-[#DA291C]/10", iconColor: "text-[#DA291C]" 
    },
    { 
      id: "familias", 
      label: "Familias Impactadas", 
      value: (data?.familias_potenciales || 0).toString(), 
      unit: "familias", 
      change: "Total acumulado apoyado", 
      icon: HeartHandshake, iconBg: "bg-rose-50", iconColor: "text-rose-500" 
    },
    { 
      id: "horas", 
      label: "Horas de Voluntariado", 
      value: (data?.horas_voluntariado || 0).toString(), 
      unit: "horas", 
      change: `${data?.empleados_voluntarios || 0} empleados participaron`, 
      icon: Clock, iconBg: "bg-blue-50", iconColor: "text-blue-500" 
    },
    { 
      id: "nivel", 
      label: "Nivel de Partnership", 
      value: data?.nivel_partnership || "Generoso", 
      unit: "", 
      change: "Conoce tus beneficios de nivel", 
      icon: Award, iconBg: "bg-amber-50", iconColor: "text-[#F59E0B]", highlight: true 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.id} className={`gap-0 p-5 ${kpi.highlight ? "border-[#F59E0B]/30 bg-amber-50/30" : ""}`}>
          <CardContent className="p-0">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
            </div>
            <p className="text-slate-500 mb-1" style={{ fontSize: "0.8125rem" }}>{kpi.label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-slate-900" style={{ fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.2 }}>{kpi.value}</span>
              {kpi.unit && <span className="text-slate-400" style={{ fontSize: "0.875rem" }}>{kpi.unit}</span>}
            </div>
            <p className="text-slate-400 mt-1.5" style={{ fontSize: "0.75rem" }}>{kpi.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}