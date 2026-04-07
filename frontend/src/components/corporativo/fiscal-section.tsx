import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, ShieldCheck } from "lucide-react";

const fiscalDocs = [
  { id: 1, period: "Septiembre 2026", amount: "$38,000 MXN", status: "Disponible", date: "01/10/2026" },
  { id: 2, period: "Agosto 2026", amount: "$30,000 MXN", status: "Disponible", date: "01/09/2026" },
  { id: 3, period: "Julio 2026", amount: "$35,000 MXN", status: "Disponible", date: "01/08/2026" },
];

export function FiscalSection() {
  return (
    <Card className="gap-0 border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><ReceiptIcon className="w-5 h-5 text-slate-400" /> Documentos Fiscales</CardTitle>
            <CardDescription style={{ fontSize: "0.8125rem" }}>Descarga tus comprobantes deducibles de impuestos</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-emerald-700" style={{ fontSize: "0.8125rem", fontWeight: 500 }}>Tu constancia de donataria autorizada 2026 está vigente</p>
        </div>
        <div className="divide-y divide-slate-100">
          {fiscalDocs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center"><FileText className="w-4 h-4 text-slate-400" /></div>
                <div>
                  <p className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{doc.period}</p>
                  <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>{doc.amount} · {doc.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer"><Download className="w-3.5 h-3.5" /> XML</Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-[#DA291C] border-[#DA291C]/20 hover:bg-[#DA291C]/5 cursor-pointer"><Download className="w-3.5 h-3.5" /> PDF</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReceiptIcon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
      <path d="M12 17.5v-11"/>
    </svg>
  );
}