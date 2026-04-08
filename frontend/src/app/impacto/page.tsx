'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { getImpactoResumen, getImpactStories, getMovimientosGlobales, resolverMision } from '@/services/api';
import { Users, Home, Sparkles, Heart, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DonacionCongrats from '@/components/donor/DonacionCongrats';
import { useSesionImpacto } from '@/components/donor/ImpactoSidebar';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function PortalImpacto() {
  const [resumen,    setResumen]    = useState<any>(null);
  const [historias,  setHistorias]  = useState<any[]>([]);
  const [hasLoaded,  setHasLoaded]  = useState(false);

  // Estado del congrats modal
  const [congrats, setCongrats] = useState<{
    nombre: string; familias: number; esCritico: boolean; hayMas: boolean;
  } | null>(null);

  const { registrarDonacion } = useSesionImpacto();
  const ctaRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [res, his] = await Promise.all([
        getImpactoResumen(),
        getImpactStories(10), // Limitamos para el zigzag
      ]);
      setResumen(res);
      setHistorias(his);
      setHasLoaded(true);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDonar = async (insumo_id: string, nombre: string) => {
    const hist = historias.find((h: any) => h.insumo_id === insumo_id);
    const consumo = hist?.consumo_estimado ?? 3;
    const familiasImpacto = Math.max(1, Math.round(consumo * 7 / 3));

    await resolverMision(insumo_id, consumo, 'publico');
    registrarDonacion(familiasImpacto);

    setCongrats({
      nombre,
      familias: familiasImpacto,
      esCritico: hist?.tipo_historia === 'rescate_critico',
      hayMas: historias.length > 1,
    });

    await fetchData();
  };

  const scrollToDonar = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navigation />

      {/* Modal post-donación */}
      {congrats && (
        <DonacionCongrats
          nombre={congrats.nombre}
          familias={congrats.familias}
          esCritico={congrats.esCritico}
          hayMasHistorias={congrats.hayMas}
          onClose={() => setCongrats(null)}
        />
      )}

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="relative mx-auto aspect-[21/9] max-w-5xl overflow-hidden rounded-2xl bg-muted shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
                <div className="text-center">
                  <Heart className="mx-auto h-16 w-16 text-primary/30" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <Badge className="mb-3 bg-[#DB0007] text-white">
                  Nuestra Misión
                </Badge>
                <h1 className="text-balance text-2xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {hasLoaded && resumen 
                    ? resumen.mensaje_hero_emocional
                    : "Nuestra Historia: Más allá de los números"}
                </h1>
                {hasLoaded && resumen && (
                   <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
                     {resumen.familias_en_riesgo > 0 
                      ? `${resumen.familias_en_riesgo} familias en riesgo inminente. Nuestro pronóstico nos ayuda a actuar antes de que sea tarde.` 
                      : 'El inventario de nuestras casas opera dentro de márgenes seguros.'}
                   </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Zigzag Stories dinámico desde API */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl space-y-16 lg:space-y-24">
            {!hasLoaded ? (
               <div className="text-center text-muted-foreground py-12">Cargando historias de impacto...</div>
            ) : historias.length === 0 ? (
               <div className="text-center text-muted-foreground py-12">No hay historias críticas en este momento. ¡El inventario está seguro!</div>
            ) : (
              historias.map((story, index) => (
                <div
                  key={story.id}
                  className={cn(
                    "flex flex-col items-center gap-8 lg:gap-12",
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  )}
                >
                  {/* Imagen Realista Dinámica */}
                  <div className="w-full lg:w-1/2">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-lg border border-border/50 group">
                      <img 
                        src={
                          story.tipo_historia === 'rescate_critico' 
                            ? "https://images.unsplash.com/photo-1623707430616-d9f956bcac2b?auto=format&fit=crop&w=800&q=80" 
                            : "https://images.unsplash.com/photo-1604599730009-fe273616197c?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={story.titulo}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Badge sobre la imagen */}
                      <div className="absolute bottom-4 left-4">
                         <div className={cn(
                           "flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm border",
                           story.tipo_historia === 'rescate_critico' 
                             ? "bg-rose-500/20 text-rose-50 border-rose-500/30" 
                             : "bg-amber-500/20 text-amber-50 border-amber-500/30"
                         )}>
                           {story.tipo_historia === 'rescate_critico' 
                             ? <Home className="h-4 w-4" />
                             : <Sparkles className="h-4 w-4" />
                           }
                           <span className="text-xs font-semibold">CareForecast IA</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Texto y Datos de la Historia */}
                  <div className="w-full lg:w-1/2">
                    <Badge variant="outline" className={cn(
                      "mb-4",
                      story.tipo_historia === 'rescate_critico' 
                        ? "border-rose-200 text-rose-700 bg-rose-50" 
                        : "border-amber-200 text-amber-700 bg-amber-50"
                    )}>
                      {story.tipo_historia === 'rescate_critico' ? 'Urgencia Crítica' : 'Prevención Inteligente'}
                    </Badge>
                    <h2 className="mb-4 text-2xl font-bold sm:text-3xl text-foreground">
                      {story.titulo}
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                      {story.historia}
                    </p>
                    
                    <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200 mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-700">Meta: {story.meta_cantidad} {story.unidad}</span>
                        <span className="text-rose-600 font-bold">Faltan {story.faltante}</span>
                      </div>
                    </div>

                    <Button 
                      size="lg" 
                      onClick={() => handleDonar(story.insumo_id, story.titulo)}
                      className={cn(
                        "gap-2 text-white shadow-md w-full sm:w-auto",
                        story.tipo_historia === 'rescate_critico' 
                          ? "bg-[#DB0007] hover:bg-red-800" 
                          : "bg-[#FFBC0D] text-black hover:bg-yellow-500"
                      )}
                    >
                      <Heart className="h-4 w-4" />
                      Resolver esta misión
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <section ref={ctaRef} className="bg-[#DB0007] px-4 py-16 sm:py-20 mt-12">
          <div className="mx-auto max-w-4xl text-center">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-white/80" />
            <h2 className="text-balance text-2xl font-bold text-white sm:text-4xl">
              Únete a nuestra causa
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
              Cada donación, sin importar su tamaño, ayuda a mantener a una
              familia cerca de su hijo cuando más lo necesita.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="gap-2 px-8 bg-[#FFBC0D] text-black hover:bg-[#E5A90B]"
              >
                <Link href="/donante">
                  <Heart className="h-5 w-5" />
                  Ir a mi Portal de Donante
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
