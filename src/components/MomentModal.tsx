import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Video as VideoIcon } from 'lucide-react';
import type { Moment } from '@/types';
import { downloadDataUrl, downloadBlobUrl } from '@/lib/storage';
import { formatDuration } from '@/lib/media';

interface MomentModalProps {
  moment: Moment | null;
  onClose: () => void;
}

export default function MomentModal({ moment, onClose }: MomentModalProps) {
  useEffect(() => {
    if (!moment) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [moment, onClose]);

  if (!moment) return null;

  const isVideo = moment.type === 'video';
  const date = new Date(moment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  function handleDownload() {
    if (!moment) return;
    if (moment.type === 'photo') {
      downloadDataUrl(moment.src, `rieke-moment-${moment.id}.jpg`);
    } else {
      downloadBlobUrl(moment.src, `rieke-video-${moment.id}.webm`);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/85 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full flex flex-col items-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            src={moment.src}
            controls
            autoPlay
            playsInline
            className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl"
          />
        ) : (
          <img
            src={moment.src}
            alt="Moment"
            className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl"
          />
        )}

        <div className="mt-4 flex items-center gap-3 text-white/80 text-sm">
          {isVideo && (
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
              <VideoIcon size={14} />
              {moment.duration ? formatDuration(moment.duration) : 'Video'}
            </span>
          )}
          <span>{date}</span>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleDownload}
            className="rounded-2xl pink-gradient text-white font-semibold py-3 px-6 flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-pink-400/30"
          >
            <Download size={18} strokeWidth={2.4} />
            Download
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 grid place-items-center h-10 w-10 rounded-full bg-white border border-pink-200 text-ink transition-transform active:scale-90 hover:bg-pink-50"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
