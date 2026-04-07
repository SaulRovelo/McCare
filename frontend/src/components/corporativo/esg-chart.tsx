import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Badge } from "../ui/badge";

const monthlyData = [
  { month: "Ene", familias: 8, donacion: 18000, voluntariado: 24 },
  { month: "Feb", familias: 12, donacion: 22000, voluntariado: 30 },
  { month: "Mar", familias: 10, donacion: 20000, voluntariado: 28 },
  { month: "Abr", familias: 15, donacion: 28000, voluntariado: 40 },
  { month: "May", familias: 18, donacion: 32000, voluntariado: 52 },
  { month: "Jun", familias: 14, donacion: 25000, voluntariado: 35 },
  { month: "Jul", familias: 20, donacion: 35000, voluntariado: 48 },
  { month: "Ago", familias: 16, donacion: 30000, voluntariado: 42 },
  { month: "Sep", familias: 22, donacion: 38000, voluntariado: 55 },
  { month: "Oct", familias: 19, donacion: 33000, voluntariado: 46 },
  { month: "Nov", familias: 0, donacion: 0, voluntariado: 0 },
  { month: "Dic", familias: 0, donacion: 0, voluntariado: 0 },
];

const odsGoals = [
  { id: 1, label: "Fin de la Pobreza", color: "#E5243B", number: "1" },
  { id: 3, label: "Salud y Bienestar", color: "#4C9F38", number: "3" },
  { id: 10, label: "Reducción de Desigualdades", color: "#DD1367", number: "10" },
  { id: 17, label: "Alianzas para los Objetivos", color: "#19486A", number: "17" },
];

export function EsgChart() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Chart */}
      <Card className="xl:col-span-2 gap-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Impacto Social Mensual</CardTitle>
              <CardDescription style={{ fontSize: "0.8125rem" }}>
                Distribución de donaciones y familias impactadas — 2026
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[#DA291C] border-[#DA291C]/30">
              ESG Report
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    fontSize: "13px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="donacion" name="Donación ($MXN)" fill="#DA291C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="voluntariado" name="Horas voluntariado" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ODS Alignment */}
      <Card className="gap-0">
        <CardHeader className="pb-2">
          <CardTitle>Alineación a ODS</CardTitle>
          <CardDescription style={{ fontSize: "0.8125rem" }}>
            Objetivos de Desarrollo Sostenible de la ONU
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-3">
            {odsGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: goal.color, fontSize: "0.875rem", fontWeight: 700 }}
                >
                  {goal.number}
                </div>
                <div>
                  <p className="text-slate-900" style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{goal.label}</p>
                  <p className="text-slate-400" style={{ fontSize: "0.6875rem" }}>ODS {goal.number}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-[#DA291C]/5 border border-[#DA291C]/10">
            <p className="text-[#DA291C]" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              Tu empresa contribuye activamente a 4 ODS a través de McCare
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
