import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessToastProps {
  show: boolean;
  message: string;
}

export default function SuccessToast({ show, message }: SuccessToastProps) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(() => {}, 2200);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center pointer-events-none animate-fade-in">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white/95 backdrop-blur-xl border border-pink-200 px-10 py-8 shadow-2xl shadow-pink-300/30 animate-scale-in">
        <div className="grid place-items-center h-16 w-16 rounded-full pink-gradient animate-pop">
          <CheckCircle2 size={36} className="text-white" strokeWidth={2.4} />
        </div>
        <p className="text-lg font-semibold text-center text-ink">{message}</p>
      </div>
    </div>
  );
}
