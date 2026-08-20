import { useState } from 'react';
import { Camera, Video as VideoIcon, Images, Sparkles } from 'lucide-react';
import type { Moment } from '@/types';
import { EVENT } from '@/lib/event';
import QrCode from './QrCode';
import MomentModal from './MomentModal';

interface MomentsPanelProps {
  moments: Moment[];
}

type Filter = 'all' | 'photo' | 'video';

export default function MomentsPanel({ moments }: MomentsPanelProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Moment | null>(null);

  const filtered = moments.filter((m) => {
    if (filter === 'all') return true;
    return m.type === filter;
  });

  const photoCount = moments.filter((m) => m.type === 'photo').length;
  const videoCount = moments.filter((m) => m.type === 'video').length;

  // QR encodes a shareable placeholder — real URL when deployed
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'photo', label: 'Photos' },
    { key: 'video', label: 'Videos' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Images size={20} className="text-pink-500" />
          <h2 className="font-display text-xl font-semibold text-ink">Moments</h2>
        </div>
        <p className="text-xs text-ink/50">
          {moments.length > 0
            ? `${moments.length} moments captured`
            : 'Momen yang berhasil diabadikan ✨'}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="px-4 pb-3">
        <div className="inline-flex p-1 rounded-xl bg-white/70 border border-pink-200">
          {tabs.map(({ key, label }) => {
            const active = filter === key;
            const count =
              key === 'all' ? moments.length : key === 'photo' ? photoCount : videoCount;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'pink-gradient text-white shadow-sm'
                    : 'text-ink/50 hover:text-ink'
                }`}
              >
                {label}
                <span className={`text-[10px] ${active ? 'text-white/80' : 'text-ink/30'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
            <div className="grid place-items-center h-16 w-16 rounded-full bg-white border border-pink-200 mb-4">
              {filter === 'video' ? (
                <VideoIcon size={26} className="text-pink-300" />
              ) : (
                <Camera size={26} className="text-pink-300" />
              )}
            </div>
            <p className="text-sm font-semibold text-ink">
              {filter === 'video'
                ? 'No videos yet'
                : filter === 'photo'
                  ? 'No photos yet'
                  : 'Belum ada momen 📷'}
            </p>
            <p className="text-xs text-ink/50 mt-1 max-w-[200px]">
              {filter === 'all'
                ? 'Jadilah yang pertama mengabadikan momen di sini.'
                : 'Capture one from the photobooth!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filtered.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className="group relative overflow-hidden rounded-xl bg-black border-2 border-white shadow-sm animate-fade-in-up"
                style={{
                  animationDelay: `${Math.min(i * 30, 240)}ms`,
                  aspectRatio: '3 / 4',
                }}
              >
                <img
                  src={m.thumbnail || m.src}
                  alt={`Moment ${i + 1}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {m.type === 'video' && (
                  <>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="grid place-items-center h-9 w-9 rounded-full bg-white/90 shadow-lg">
                        <VideoIcon size={16} className="text-pink-600 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    {m.duration && (
                      <span className="absolute bottom-1.5 right-1.5 text-[10px] font-medium text-white bg-black/60 rounded px-1.5 py-0.5">
                        {Math.floor(m.duration / 60)}:{String(m.duration % 60).padStart(2, '0')}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* QR section */}
      <div className="border-t border-pink-100 bg-white/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <QrCode value={shareUrl} size={64} />
          <div className="flex-1">
            <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <Sparkles size={13} className="text-pink-500" />
              Scan to open
            </p>
            <p className="text-[11px] text-ink/50 mt-0.5 leading-relaxed">
              Share this QR with guests so they can capture their own moments at{' '}
              <span className="font-medium text-pink-600">{EVENT.name1}'s engagement</span>.
            </p>
          </div>
        </div>
      </div>

      <MomentModal moment={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
