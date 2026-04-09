import { Heart } from "lucide-react"

export default function MisionesActivasPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center p-6 min-h-[60vh]">
      <div className="bg-white border border-slate-200 shadow-md hover:shadow-lg transition-shadow rounded-2xl p-12 max-w-2xl w-full text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <Heart className="w-8 h-8 text-[#DA291C] fill-[#DA291C]/20" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Próximamente
        </h2>
        <p className="text-slate-500 text-lg leading-relaxed max-w-md mx-auto">
          Aquí, después podrás ver más formas de brindar tu ayuda... <br/> 
          <span className="font-semibold text-[#DA291C] mt-2 block">¡Gracias!</span>
        </p>
      </div>
    </div>
  )
}
