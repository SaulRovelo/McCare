"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Descarga un archivo del backend con autenticación JWT.
 * Convierte la respuesta en un Blob y lo descarga en el navegador.
 */
async function descargarArchivo(docId: string, tipo: "pdf" | "xml") {
  const token = typeof window !== "undefined" ? localStorage.getItem("mccare_token") : null;
  const res = await fetch(`${API_URL}/api/corporativo/documentos/${docId}/${tipo}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Error al descargar ${tipo.toUpperCase()}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = tipo === "pdf"
    ? `ComprobanteFiscal_${docId.slice(0, 8).toUpperCase()}.pdf`
    : `CFDI_${docId.slice(0, 8).toUpperCase()}.xml`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function FiscalSection({ documentos }: { documentos?: any[] }) {
  const fiscalDocs = documentos || [];
  // Mapa { docId: "pdf" | "xml" | null } para mostrar estado de carga por boton
  const [loading, setLoading] = useState<Record<string, "pdf" | "xml" | null>>({});

  const handleDescargar = async (docId: string, tipo: "pdf" | "xml") => {
    setLoading((prev) => ({ ...prev, [docId + tipo]: tipo }));
    try {
      await descargarArchivo(docId, tipo);
    } catch (err) {
      console.error(err);
      alert(`No se pudo descargar el ${tipo.toUpperCase()}. Intenta de nuevo.`);
    } finally {
      setLoading((prev) => ({ ...prev, [docId + tipo]: null }));
    }
  };

  return (
    <Card className="gap-0 border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ReceiptIcon className="w-5 h-5 text-slate-400" />
              Documentos Fiscales
            </CardTitle>
            <CardDescription style={{ fontSize: "0.8125rem" }}>
              Descarga tus comprobantes deducibles de impuestos
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 space-y-3">
        {/* Constancia de donataria */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-emerald-700" style={{ fontSize: "0.8125rem", fontWeight: 500 }}>
            Tu constancia de donataria autorizada {new Date().getFullYear()} está vigente
          </p>
        </div>

        {/* Lista de documentos */}
        <div className="divide-y divide-slate-100">
          {fiscalDocs.length === 0 && (
            <p className="text-sm text-slate-500 py-4 text-center">
              No hay documentos fiscales disponibles por ahora.
            </p>
          )}
          {fiscalDocs.map((doc, idx) => {
            const isLoadingPDF = loading[doc.id + "pdf"] === "pdf";
            const isLoadingXML = loading[doc.id + "xml"] === "xml";
            return (
              <div key={idx} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {doc.mes_texto} {doc.anio}
                    </p>
                    <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>
                      ${(doc.monto_amparado || 0).toLocaleString("es-MX")} MXN
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Botón XML */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 cursor-pointer"
                    disabled={isLoadingXML}
                    onClick={() => handleDescargar(doc.id, "xml")}
                  >
                    {isLoadingXML
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Download className="w-3.5 h-3.5" />}
                    XML
                  </Button>

                  {/* Botón PDF */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-[#DA291C] border-[#DA291C]/20 hover:bg-[#DA291C]/5 cursor-pointer"
                    disabled={isLoadingPDF}
                    onClick={() => handleDescargar(doc.id, "pdf")}
                  >
                    {isLoadingPDF
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Download className="w-3.5 h-3.5" />}
                    PDF
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ReceiptIcon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  );
}