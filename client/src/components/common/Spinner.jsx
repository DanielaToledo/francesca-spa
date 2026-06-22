import { Loader2 } from 'lucide-react';

export default function Spinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-[#A87379]" size={48} />
        <p className="text-[#A87379] font-medium animate-pulse">Cargando...</p>
      </div>
    </div>
  );
}