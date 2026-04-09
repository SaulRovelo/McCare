import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, TrendingUp } from "lucide-react";

export function MatchingGifts({ campanias }: { campanias?: any[] }) {
  const campania = campanias && campanias.length > 0 ? campanias[0] : null;

  const employeeDonated = campania?.progreso_empleados_mxn || 0;
  const companyMatched = campania?.progreso_empresa_mxn || 0;
  const goal = campania?.meta_mxn || 1; // evitar division por cero
  const employeePercent = (employeeDonated / goal) * 100;
  const companyPercent = (companyMatched / goal) * 100;
  const total = employeeDonated + companyMatched;

  if (!campania) {
    return (
      <Card className="gap-0 border-2">
        <CardHeader className="pb-2 text-center">
            <CardTitle>Campañas Activas</CardTitle>
            <CardDescription>Actualmente no hay campañas activas</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="gap-0 border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Campañas Activas</CardTitle>
            <CardDescription style={{ fontSize: "0.8125rem" }}>Matching Gifts — {campania.tipo_matching || "1:1"}</CardDescription>
          </div>
          <Badge className="bg-[#F59E0B] text-white border-transparent">Activa</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2 space-y-5">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-slate-900 mb-1" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{campania.nombre_campania}</p>
          <p className="text-slate-500" style={{ fontSize: "0.8125rem" }}>Por cada peso que donan los empleados, la empresa iguala la cantidad</p>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-500" style={{ fontSize: "0.75rem" }}>Progreso total</span>
            <span className="text-slate-900" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              ${total.toLocaleString()} / ${(campania.meta_mxn || 0).toLocaleString()} MXN
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-[#DA291C] transition-all" style={{ width: `${Math.min(employeePercent, 100)}%` }} />
            <div className="h-full bg-[#F59E0B] transition-all" style={{ width: `${Math.min(companyPercent, 100)}%` }} />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#DA291C]" /><span className="text-slate-500" style={{ fontSize: "0.6875rem" }}>Empleados</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /><span className="text-slate-500" style={{ fontSize: "0.6875rem" }}>Empresa</span></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-[#DA291C]/5 border border-[#DA291C]/10">
            <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-[#DA291C]" /><span className="text-slate-500" style={{ fontSize: "0.6875rem" }}>Empleados</span></div>
            <p className="text-slate-900" style={{ fontSize: "1.25rem", fontWeight: 600 }}>${employeeDonated.toLocaleString()}</p>
            <p className="text-slate-400" style={{ fontSize: "0.6875rem" }}>Participantes activos</p>
          </div>
          <div className="p-3 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/15">
            <div className="flex items-center gap-2 mb-2"><Building2 className="w-4 h-4 text-[#F59E0B]" /><span className="text-slate-500" style={{ fontSize: "0.6875rem" }}>Empresa</span></div>
            <p className="text-slate-900" style={{ fontSize: "1.25rem", fontWeight: 600 }}>${companyMatched.toLocaleString()}</p>
            <p className="text-slate-400" style={{ fontSize: "0.6875rem" }}>{campania.tipo_matching || "Matching 1:1"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <TrendingUp className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <p className="text-amber-700" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
            {goal - total > 0 ? `¡Faltan $${(goal - total).toLocaleString()} MXN para alcanzar la meta!` : "¡Meta alcanzada exitosamente!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}