"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Badge } from "../ui/badge";
import { getImpactoMensual } from "@/services/api";

/** ODS fijos: representan el alineamiento con la misión de Ronald McDonald House */
const odsGoals = [
  { id: 1,  label: "Fin de la Pobreza",           color: "#E5243B", number: "1"  },
  { id: 3,  label: "Salud y Bienestar",            color: "#4C9F38", number: "3"  },
  { id: 10, label: "Reducción de Desigualdades",   color: "#DD1367", number: "10" },
  { id: 17, label: "Alianzas para los Objetivos",  color: "#19486A", number: "17" },
];

type MensualItem = { mes: string; donacion: number; voluntariado: number };

export function EsgChart() {
  const [monthlyData, setMonthlyData] = useState<MensualItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const anio = new Date().getFullYear();
    getImpactoMensual(anio)
      .then((data: MensualItem[]) => setMonthlyData(data))
      .catch(() => {
        // Fallback silencioso: mantener datos vacíos sin romper la UI
        setMonthlyData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Gráfica de barras */}
      <Card className="xl:col-span-2 gap-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Impacto Social Mensual</CardTitle>
              <CardDescription style={{ fontSize: "0.8125rem" }}>
                Distribución de donaciones y horas de voluntariado — {new Date().getFullYear()}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[#DA291C] border-[#DA291C]/30">
              ESG Report
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] w-full min-h-[280px] min-w-0">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Cargando datos de Supabase…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                      fontSize: "13px",
                    }}
                    formatter={(value: any, name: any) => [
                      name === "donacion"
                        ? `$${Number(value).toLocaleString("es-MX")} MXN`
                        : `${value} hrs`,
                      name === "donacion" ? "Donación" : "Voluntariado",
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) =>
                      value === "donacion" ? "Donación ($MXN)" : "Horas voluntariado"
                    }
                  />
                  <Bar dataKey="donacion"    name="donacion"    fill="#DA291C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="voluntariado" name="voluntariado" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ODS Alignment — alineamiento institucional fijo con misión McCare */}
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
              Tu empresa contribuye activamente a {odsGoals.length} ODS a través de McCare
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
