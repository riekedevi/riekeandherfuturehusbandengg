import { Camera, Video } from 'lucide-react';
import type { CaptureMode } from '@/types';

interface ModeSelectorProps {
  mode: CaptureMode;
  onChange: (mode: CaptureMode) => void;
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="inline-flex p-1 rounded-2xl bg-white/80 backdrop-blur border border-pink-200 shadow-sm">
      {(
        [
          { key: 'photo' as const, label: 'Photo', icon: Camera },
          { key: 'video' as const, label: 'Video', icon: Video },
        ]
      ).map(({ key, label, icon: Icon }) => {
        const active = mode === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
              active
                ? 'pink-gradient text-white shadow-md shadow-pink-400/30'
                : 'text-ink/60 hover:text-ink'
            }`}
          >
            <Icon size={17} strokeWidth={2.4} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
