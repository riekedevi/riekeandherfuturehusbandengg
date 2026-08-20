import { useEffect, useState } from 'react';
import { Camera, Images } from 'lucide-react';
import Photobooth from '@/components/Photobooth';
import MomentsPanel from '@/components/MomentsPanel';
import { loadMoments, saveMoments } from '@/lib/storage';
import { EVENT } from '@/lib/event';
import type { Moment } from '@/types';

type MobileTab = 'booth' | 'moments';

export default function App() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [mobileTab, setMobileTab] = useState<MobileTab>('booth');

  useEffect(() => {
    setMoments(loadMoments());
  }, []);

  useEffect(() => {
    saveMoments(moments);
  }, [moments]);

  function handleMomentAdded(moment: Moment) {
    setMoments((prev) => [moment, ...prev]);
  }

  return (
    <div className="min-h-[100dvh] pink-gradient-soft">
      {/* Top brand bar */}
      <header className="safe-top bg-white/60 backdrop-blur-md border-b border-pink-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center h-9 w-9 rounded-full pink-gradient shadow-sm">
              <Camera size={18} className="text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="font-display text-base font-semibold text-ink">
                {EVENT.title}
              </h1>
              <p className="text-[10px] uppercase tracking-[0.18em] text-pink-500 font-medium">
                {EVENT.subtitle}
              </p>
            </div>
          </div>
          <p className="hidden sm:block text-xs text-ink/40 italic">
            {EVENT.tagline}
          </p>
        </div>
      </header>

      {/* Desktop split layout / mobile stacked */}
      <main className="max-w-7xl mx-auto lg:grid lg:grid-cols-[1fr_400px] lg:gap-0">
        {/* Photobooth */}
        <section
          className={`${
            mobileTab === 'booth' ? 'block' : 'hidden'
          } lg:block px-3 sm:px-6 py-4`}
        >
          <Photobooth onMomentAdded={handleMomentAdded} />
        </section>

        {/* Moments */}
        <aside
          className={`${
            mobileTab === 'moments' ? 'block' : 'hidden'
          } lg:block bg-white/40 lg:bg-white/30 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-pink-100 min-h-[60vh] lg:min-h-[calc(100dvh-60px)]`}
        >
          <MomentsPanel moments={moments} />
        </aside>
      </main>

      {/* Mobile bottom tab nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 safe-bottom bg-white/90 backdrop-blur-lg border-t border-pink-100">
        <div className="flex">
          <button
            onClick={() => setMobileTab('booth')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              mobileTab === 'booth' ? 'text-pink-600' : 'text-ink/40'
            }`}
          >
            <Camera size={20} strokeWidth={2.2} />
            <span className="text-[11px] font-medium">Photobooth</span>
          </button>
          <button
            onClick={() => setMobileTab('moments')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors relative ${
              mobileTab === 'moments' ? 'text-pink-600' : 'text-ink/40'
            }`}
          >
            <Images size={20} strokeWidth={2.2} />
            <span className="text-[11px] font-medium">Moments</span>
            {moments.length > 0 && (
              <span className="absolute top-1 right-[28%] min-w-[16px] h-4 px-1 grid place-items-center rounded-full pink-gradient text-white text-[9px] font-bold">
                {moments.length > 99 ? '99+' : moments.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="lg:hidden h-14" />
    </div>
  );
}
