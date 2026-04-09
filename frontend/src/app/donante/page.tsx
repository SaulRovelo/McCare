"use client";

import { useState, useEffect } from "react";
import { getImpactStories } from "@/services/api";
import { motion } from "framer-motion"; // motion/react in the payload but usually framer-motion in nextjs
import {
  Heart,
  Star,
  CalendarDays,
  DollarSign,
  ChevronRight,
  Download,
  FileText,
  ArrowRight,
  Flame,
  Clock,
  Users,
  Home,
  Medal,
  Sparkles,
  TrendingUp,
  Zap,
  Shield,
  Target,
  RefreshCw,
} from "lucide-react";

/* ═══════════════════════════════════════════
   ANIMATION HELPERS
   ═══════════════════════════════════════════ */

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame: number;
    const dur = 1100;
    const start = performance.now();
    const run = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setCount(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(run);
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return <>{count.toLocaleString('es-MX')}</>;
}

/* ═══════════════════════════════════════════
   DONUT CHART (pure SVG)
   ═══════════════════════════════════════════ */

const fundSegments = [
  { label: "Salud", pct: 40, color: "#DA291C" },
  { label: "Educación", pct: 30, color: "#FFBC0D" },
  { label: "Remodelación", pct: 20, color: "#3B82F6" },
  { label: "Operación", pct: 10, color: "#94A3B8" },
];

function DonutChart() {
  const r = 42;
  const c = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {fundSegments.map((s) => {
        const d = (s.pct / 100) * c;
        const o = off;
        off += d;
        return (
          <circle key={s.label} cx="60" cy="60" r={r} fill="none" stroke={s.color} strokeWidth="14"
            strokeDasharray={`${d} ${c - d}`} strokeDashoffset={-o} strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
        );
      })}
      <text x="60" y="56" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="800">100%</text>
      <text x="60" y="70" textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontWeight="500">Transparencia</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const fallbackDescriptions: Record<string, string> = {
  "Pañales": "Cada pañal es una caricia de dignidad para un bebé en tratamiento. Tu donación protege la piel más vulnerable.",
  "Kits": "Un kit de bienvenida que dice 'no estás solo'. Contiene artículos de higiene, cobijas y material de confort.",
  "Medicamentos": "Medicamentos pediátricos que alivian el dolor y aceleran la recuperación de los niños más valientes.",
  "Alimentos": "Alimentos nutritivos que sostienen la energía de los niños y sus familias durante los días más difíciles.",
  "Higiene": "Artículos esenciales de cuidado personal para familias que salieron de casa inesperadamente y necesitan mantenerse fuertes.",
  "Médico": "Suministros médicos críticos para el cuidado continuo en el albergue pediátrico.",
  "Logística": "Apoyo logístico que conecta a las familias con los recursos que necesitan urgentemente.",
};

// Imágenes de producto por categoría
const categoryImages: Record<string, string> = {
  "Higiene": "https://images.unsplash.com/photo-1623707430616-d9f956bcac2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
  "Alimentos": "https://images.unsplash.com/photo-1601600576337-c1d8a0d1373c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
  "Médico": "https://images.unsplash.com/photo-1689580911770-c9305f6ac513?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
  "Logística": "https://images.unsplash.com/photo-1604599730009-fe273616197c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
};

type MissionData = {
  id: string;
  title: string;
  urgency: "URGENCIA CRÍTICA" | "EN ATENCIÓN";
  badge: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  daysLeft: number;    // dias_para_nivel_critico — mismo campo que Forecast admin
  donors: number;
  sede: string;
  categoria: string;
  insumo_id: string;
  faltante?: string;
};

const sedesMap: Record<string, string> = {
  cdmx: "CDMX",
  puebla: "Puebla",
  edomex: "EdoMex",
};

const sedes = [
  { key: "all", label: "Todas las Sedes" },
  { key: "CDMX", label: "Casa CDMX" },
  { key: "Puebla", label: "Casa Puebla" },
  { key: "EdoMex", label: "Casa Edo. de México" },
];

const donationHistory = [
  { id: 1, icon: DollarSign, category: "Mensual", date: "15 Abr 2026", mission: "Aportación Mensual General", amount: "500.00 MXN", impact: "5 familias" },
  { id: 2, icon: Shield, category: "Médico", date: "08 Mar 2026", mission: "Kits de Admisión Hospitalaria", amount: "1,200.00 MXN", impact: "12 familias" },
  { id: 3, icon: DollarSign, category: "Mensual", date: "15 Mar 2026", mission: "Aportación Mensual General", amount: "500.00 MXN", impact: "5 familias" },
  { id: 4, icon: Home, category: "Infraestructura", date: "28 Ene 2026", mission: "Remodelación Cocina CDMX", amount: "2,500.00 MXN", impact: "50 familias" },
  { id: 5, icon: DollarSign, category: "Mensual", date: "15 Feb 2026", mission: "Aportación Mensual General", amount: "500.00 MXN", impact: "5 familias" },
  { id: 6, icon: DollarSign, category: "Mensual", date: "15 Ene 2026", mission: "Aportación Mensual General", amount: "500.00 MXN", impact: "5 familias" },
];

/* ═══════════════════════════════════════════
   MISSION CARD COMPONENT
   ═══════════════════════════════════════════ */

function MissionCard({ m }: { m: MissionData }) {
  const pct = m.goal > 0 ? Math.round((m.raised / m.goal) * 100) : 0;
  const remaining = m.goal - m.raised;
  const isUrgent = m.urgency === "URGENCIA CRÍTICA";
  const daysText = m.daysLeft <= 0 ? "Zona crítica" : `${Math.round(m.daysLeft)} días`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      {/* Image */}
      <div className="relative h-44">
        <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Left badge: Urgency */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm ${
            isUrgent
              ? "bg-[#DA291C]/25 border border-[#DA291C]/40 text-red-200"
              : "bg-amber-500/20 border border-amber-400/30 text-amber-200"
          }`} style={{ fontSize: "0.5625rem", fontWeight: 700, letterSpacing: "0.04em" }}>
            {isUrgent && <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-300" /></span>}
            {!isUrgent && <Flame className="w-2.5 h-2.5" />}
            {m.urgency}
          </span>
        </div>

        {/* Right badge: Time -- uses SAME dias_para_nivel_critico as Forecast admin */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 bg-amber-500/20 backdrop-blur-sm text-amber-200 border border-amber-400/25 px-2.5 py-1 rounded-full" style={{ fontSize: "0.5625rem", fontWeight: 600 }}>
            <Clock className="w-3 h-3" />
            {daysText}
          </span>
        </div>

        {/* Bottom over image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 700, lineHeight: 1.3 }}>
            {m.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3.5">
        {/* Description */}
        <p className="text-slate-500 line-clamp-2" style={{ fontSize: "0.75rem", lineHeight: 1.6 }}>
          {m.description}
        </p>

        {/* Urgency Info — sustituye la barra de progreso por datos reales de insumo */}
        <div className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${isUrgent ? "bg-red-50 border border-red-100" : "bg-amber-50 border border-amber-100"}`}>
          <div className="flex items-center gap-2">
            <span className={`relative flex h-2 w-2`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isUrgent ? "bg-red-400" : "bg-amber-400"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isUrgent ? "bg-red-500" : "bg-amber-500"}`} />
            </span>
            <span className={`font-semibold ${isUrgent ? "text-red-600" : "text-amber-600"}`}>
              {m.categoria.toUpperCase()}
            </span>
          </div>
          <span className="text-slate-400 font-medium">{m.faltante} requeridas</span>
        </div>

        {/* 3-column urgency metrics */}
        <div className={`grid grid-cols-3 gap-2 rounded-xl p-3 ${isUrgent ? "bg-red-50/60 border border-red-100" : "bg-amber-50/50 border border-amber-100"}`}>
          <div className="text-center">
            <Target className={`w-3.5 h-3.5 mx-auto mb-1 ${isUrgent ? "text-[#DA291C]" : "text-amber-500"}`} />
            <p className="text-slate-400" style={{ fontSize: "0.5625rem", fontWeight: 500 }}>Necesarias</p>
            <p className="text-slate-800 leading-tight" style={{ fontSize: "0.6875rem", fontWeight: 700 }}>{m.goal > 0 ? `${m.goal} uds` : "--"}</p>
          </div>
          <div className="text-center border-x border-slate-200/50">
            <Clock className={`w-3.5 h-3.5 mx-auto mb-1 ${isUrgent ? "text-[#DA291C]" : "text-amber-500"}`} />
            <p className="text-slate-400" style={{ fontSize: "0.5625rem", fontWeight: 500 }}>Restante</p>
            <p className="text-slate-800" style={{ fontSize: "0.75rem", fontWeight: 700 }}>{daysText}</p>
          </div>
          <div className="text-center">
            <Zap className={`w-3.5 h-3.5 mx-auto mb-1 ${isUrgent ? "text-[#DA291C]" : "text-amber-500"}`} />
            <p className="text-slate-400" style={{ fontSize: "0.5625rem", fontWeight: 500 }}>Falta</p>
            <p className="text-slate-800" style={{ fontSize: "0.75rem", fontWeight: 700 }}>{m.faltante || "--"}</p>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full bg-[#DA291C] hover:bg-[#b8221a] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
          <Heart className="w-4 h-4" />
          Aportar a esta misión
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function DonorHomePage() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [activeSede, setActiveSede] = useState("all");
  const [allMissions, setAllMissions] = useState<MissionData[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(true);

  useEffect(() => {
    setMissionsLoading(true);
    getImpactStories(30)
      .then((stories: any[]) => {
        const mapped: MissionData[] = stories.map((s) => {
          // daysLeft = dias_para_nivel_critico, misma métrica que Forecast admin
          const daysLeft = s.dias_restantes ?? 0;
          const sedeKey = (s.casa || "").replace("Casa ", "").toLowerCase();
          const sedeLabel = sedesMap[sedeKey] || sedeKey.toUpperCase();
          const isUrgent = s.tipo_historia === "rescate_critico";
          // Meta en MXN: meta_cantidad * costo_unitario no disponible aquí,
          // usamos meta_cantidad como unidades y construimos la meta en texto
          const metaUnidades = s.meta_cantidad || 0;
          // goal en MXN aproximado: usamos 0 para no mostrar barra de progreso falsa
          return {
            id: s.id,
            title: `${s.nombre_insumo} — ${s.casa || "McCare"}`,
            urgency: isUrgent ? "URGENCIA CRÍTICA" : "EN ATENCIÓN",
            badge: isUrgent ? "CAREFORECAST IA" : "PREVENCIÓN IA",
            description:
              s.historia ||
              s.descripcion ||
              fallbackDescriptions[s.categoria] ||
              fallbackDescriptions["Higiene"],
            image:
              categoryImages[s.categoria] ||
              categoryImages["Higiene"],
            raised: 0,
            goal: metaUnidades,       // Unidades requeridas
            daysLeft,                 // dias_para_nivel_critico — MISMO que Forecast
            donors: 0,
            sede: sedeLabel,
            categoria: s.categoria || "General",
            insumo_id: s.insumo_id,
            faltante: s.faltante || `${metaUnidades} uds`,
          };
        });
        setAllMissions(mapped);
      })
      .catch(console.error)
      .finally(() => setMissionsLoading(false));
  }, []);

  const filteredMissions = activeSede === "all"
    ? allMissions
    : allMissions.filter((m) => m.sede === activeSede);

  return (
    <div className="w-full space-y-5">
      {/* ══════════════════════════════════════
          ROW 1: HERO BANNER
          ══════════════════════════════════════ */}
      <FadeUp>
        <div className="relative rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d1520 40%, #4a1a1a 70%, #1a1a2e 100%)" }}>
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#DA291C]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-[#FFBC0D]/8 rounded-full blur-[80px]" />

          <div className="relative px-6 py-6 sm:px-8 lg:px-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="flex-1 min-w-0">
                <h1 className="text-white" style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                  ¡Hola, María Alejandra!
                </h1>
                <p className="text-white/50 mt-1 max-w-md" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
                  Gracias por ser el héroe de hoy. Tu generosidad cambia vidas.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="text-white/80" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                      Mensual Activa · <span className="text-white" style={{ fontWeight: 700 }}>500 MXN/mes</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-white/35" style={{ fontSize: "0.6875rem" }}>
                    <CalendarDays className="w-3 h-3" />
                    <span>Próximo cobro: 15 Mayo 2026</span>
                  </div>
                  <button className="text-[#FFBC0D] hover:text-[#e5a90c] flex items-center gap-0.5 transition-colors cursor-pointer" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    Gestionar<ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex gap-6 sm:gap-8 shrink-0 items-center">
                <div className="text-right">
                  <p className="text-white" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}>
                    <CountUp target={220} />
                  </p>
                  <p className="text-white/35 mt-1" style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Familias Apoyadas
                  </p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-right">
                  <p className="text-white" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}>
                    <CountUp target={17500} /> <span className="text-xl">MXN</span>
                  </p>
                  <p className="text-white/35 mt-1" style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Impacto Total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ══════════════════════════════════════
          ROW 2: 4 KPI BENTO CARDS
          ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { bg: "from-red-50", border: "border-red-100/60", iconBg: "bg-[#DA291C]/10", icon: Home, iconColor: "text-[#DA291C]", label: "Familias Beneficiadas", value: <CountUp target={220} />, sub: "+12 este mes", subIcon: TrendingUp, subColor: "text-emerald-600", subIconColor: "text-emerald-500" },
          { bg: "from-pink-50", border: "border-pink-100/60", iconBg: "bg-pink-500/10", icon: Heart, iconColor: "text-pink-500", label: "Aportaciones Totales", value: "8", sub: "Donante Leal", subIcon: Star, subColor: "text-pink-500", subIconColor: "text-pink-400" },
          { bg: "from-amber-50", border: "border-amber-100/60", iconBg: "bg-[#FFBC0D]/12", icon: DollarSign, iconColor: "text-[#F59E0B]", label: "Impacto Acumulado", value: "17.5K MXN", sub: "Top 5% Global", subIcon: Sparkles, subColor: "text-amber-600", subIconColor: "text-[#F59E0B]" },
          { bg: "from-emerald-50", border: "border-emerald-100/60", iconBg: "bg-emerald-500/10", icon: FileText, iconColor: "text-emerald-600", label: "Recibos Fiscales", value: "10", sub: null, subIcon: null, subColor: "", subIconColor: "" },
        ].map((c, i) => (
          <FadeUp key={i} delay={0.05 + i * 0.05}>
            <div className={`bg-gradient-to-br ${c.bg} to-white rounded-2xl ${c.border} p-4 hover:shadow-md transition-all duration-300 h-full`}>
              <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center mb-3`}>
                <c.icon className={`w-4.5 h-4.5 ${c.iconColor}`} />
              </div>
              <p className="text-slate-500" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>{c.label}</p>
              <p className="text-slate-900 mt-0.5" style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}>{c.value}</p>
              {c.sub ? (
                <div className="flex items-center gap-1 mt-2">
                  {c.subIcon && <c.subIcon className={`w-3 h-3 ${c.subIconColor}`} />}
                  <span className={c.subColor} style={{ fontSize: "0.625rem", fontWeight: 600 }}>{c.sub}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2.5">
                  <button className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-slate-200" style={{ fontSize: "0.5625rem", fontWeight: 700 }}>
                    <Download className="w-2.5 h-2.5" /> XML
                  </button>
                  <button className="flex items-center gap-1 bg-[#DA291C]/8 hover:bg-[#DA291C]/15 text-[#DA291C] px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-[#DA291C]/15" style={{ fontSize: "0.5625rem", fontWeight: 700 }}>
                    <Download className="w-2.5 h-2.5" /> PDF
                  </button>
                </div>
              )}
            </div>
          </FadeUp>
        ))}
      </div>

      {/* ══════════════════════════════════════
          ROW 3: Missions (Left 40%) + History (Right 60%)
          ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-5">
        {/* ── LEFT: Missions Grid (4/10 = 40%) ── */}
        <FadeUp delay={0.25} className="xl:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-slate-900" style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                Misiones Críticas Activas
              </h2>
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400" style={{ fontSize: "0.6875rem" }}>
                Necesidades detectadas por CareforecastIA
              </p>
              <button className="flex items-center gap-1 text-slate-400 hover:text-[#DA291C] transition-colors cursor-pointer" style={{ fontSize: "0.625rem", fontWeight: 600 }}>
                <RefreshCw className="w-3 h-3" />
                Actualizar datos
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
              {sedes.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSede(s.key)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeSede === s.key
                      ? "bg-[#DA291C] text-white shadow-sm"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                  style={{ fontSize: "0.6875rem", fontWeight: 600 }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Scrollable mission cards */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ maxHeight: "600px" }}>
              {missionsLoading ? (
                <div className="flex items-center justify-center h-40 text-slate-400" style={{ fontSize: "0.8125rem" }}>
                  <span className="animate-pulse">Cargando misiones en tiempo real...</span>
                </div>
              ) : filteredMissions.length > 0 ? (
                filteredMissions.map((m) => <MissionCard key={m.id} m={m} />)
              ) : (
                <div className="flex items-center justify-center h-40 text-slate-400" style={{ fontSize: "0.8125rem" }}>
                  No hay misiones activas en esta sede. ¡El inventario está sano!
                </div>
              )}
            </div>
          </div>
        </FadeUp>

        {/* ── RIGHT: History + Fund Chart (6/10 = 60%) ── */}
        <FadeUp delay={0.3} className="xl:col-span-6">
          <div className="space-y-5 h-full flex flex-col">
            {/* History Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex-1 flex flex-col">
              <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-slate-900" style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                    Historial de Contribuciones y Certificados
                  </h2>
                  <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.6875rem" }}>
                    Tus aportaciones son <span className="text-emerald-600" style={{ fontWeight: 600 }}>100% deducibles de impuestos</span>.
                  </p>
                </div>
                <button className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>
                  <Download className="w-3.5 h-3.5" /> Descargar todo
                </button>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {[
                        { label: "Insumo / Misión", align: "text-left" },
                        { label: "Fecha", align: "text-left" },
                        { label: "Monto", align: "text-right" },
                        { label: "Impacto", align: "text-right" },
                        { label: "Recibo Fiscal", align: "text-center" },
                      ].map((h) => (
                        <th key={h.label} className={`text-slate-400 px-4 py-2.5 ${h.align}`}
                          style={{ fontSize: "0.5625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {donationHistory.map((row) => {
                      const IconComp = row.icon;
                      const catColors: Record<string, string> = {
                        Mensual: "bg-blue-50 text-blue-500",
                        Médico: "bg-red-50 text-[#DA291C]",
                        Infraestructura: "bg-amber-50 text-amber-600",
                      };
                      return (
                        <tr key={row.id}
                          className={`border-b border-slate-50 transition-colors ${hoveredRow === row.id ? "bg-slate-50/60" : ""}`}
                          onMouseEnter={() => setHoveredRow(row.id)}
                          onMouseLeave={() => setHoveredRow(null)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${catColors[row.category] || "bg-slate-50 text-slate-500"}`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-slate-800" style={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.3 }}>{row.mission}</p>
                                <p className="text-slate-400" style={{ fontSize: "0.5625rem", fontWeight: 500 }}>{row.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className="text-slate-500" style={{ fontSize: "0.75rem" }}>{row.date}</span></td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-slate-900" style={{ fontSize: "0.75rem", fontWeight: 700 }}>{row.amount}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-slate-500" style={{ fontSize: "0.6875rem", fontWeight: 500 }}>{row.impact}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="inline-flex items-center gap-1 bg-[#DA291C]/7 hover:bg-[#DA291C]/14 text-[#DA291C] px-2.5 py-1 rounded-md transition-colors cursor-pointer" style={{ fontSize: "0.5625rem", fontWeight: 700 }}>
                              <Download className="w-2.5 h-2.5" /> PDF
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-slate-400" style={{ fontSize: "0.625rem" }}>Mostrando 6 de 10 contribuciones</p>
                <button className="text-[#DA291C] hover:text-[#b8221a] flex items-center gap-1 transition-colors cursor-pointer" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>
                  Ver historial completo<ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Fund Allocation + Recognition row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Donut */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-slate-900" style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                      Asignación de Fondos
                    </h2>
                    <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.6875rem" }}>Transparencia total</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full" style={{ fontSize: "0.5625rem", fontWeight: 700 }}>
                    Auditado 2025
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-28 h-28 shrink-0"><DonutChart /></div>
                  <div className="flex-1 space-y-2.5">
                    {fundSegments.map((seg) => (
                      <div key={seg.label}>
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                            <span className="text-slate-600" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>{seg.label}</span>
                          </div>
                          <span className="text-slate-500" style={{ fontSize: "0.6875rem", fontWeight: 700 }}>{seg.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${seg.pct}%`, backgroundColor: seg.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Donor Recognition */}
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1520] rounded-2xl border border-white/5 p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#FFBC0D]/10 rounded-full blur-[50px]" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#DA291C]/10 rounded-full blur-[40px]" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FFBC0D] to-[#F59E0B] flex items-center justify-center shadow-lg shadow-[#FFBC0D]/20">
                      <Medal className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                      <p className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Nivel Oro</p>
                      <p className="text-white/40" style={{ fontSize: "0.625rem", fontWeight: 500 }}>Reconocimiento McCare 2026</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Donaciones consecutivas", value: "8 meses", icon: Star },
                      { label: "Misiones completadas", value: "3 de 5", icon: Flame },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between bg-white/6 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <item.icon className="w-3 h-3 text-[#FFBC0D]" />
                          <span className="text-white/55" style={{ fontSize: "0.625rem", fontWeight: 500 }}>{item.label}</span>
                        </div>
                        <span className="text-white" style={{ fontSize: "0.6875rem", fontWeight: 700 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/35" style={{ fontSize: "0.5625rem" }}>Progreso a Platino</span>
                      <span className="text-[#FFBC0D]" style={{ fontSize: "0.625rem", fontWeight: 700 }}>72%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#FFBC0D] to-[#F59E0B]" style={{ width: "72%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* ══════════════════════════════════════
          FOOTER
          ══════════════════════════════════════ */}
      <FadeUp delay={0.4}>
        <div className="bg-white rounded-2xl border border-slate-100 px-6 py-4 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#DA291C] fill-[#DA291C]" />
              <span className="text-slate-500" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                McCare · Fundación Infantil Ronald McDonald · <span className="text-slate-400">Todos los derechos reservados 2026</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              {["Aviso de Privacidad", "Términos", "Contacto"].map((link) => (
                <button key={link} className="text-slate-400 hover:text-[#DA291C] transition-colors cursor-pointer" style={{ fontSize: "0.6875rem", fontWeight: 500 }}>
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
