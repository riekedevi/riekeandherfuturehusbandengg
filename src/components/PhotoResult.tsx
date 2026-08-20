import { RefreshCw, Send } from 'lucide-react';

interface PhotoResultProps {
  photoUrl: string;
  onRetake: () => void;
  onSend: () => void;
  sending: boolean;
}

export default function PhotoResult({ photoUrl, onRetake, onSend, sending }: PhotoResultProps) {
  return (
    <div className="flex flex-col items-center w-full animate-fade-in-up">
      <p className="font-display text-xl font-semibold text-ink mb-3">Your Photos</p>
      <div
        className="relative rounded-2xl overflow-hidden border-4 border-white shadow-2xl shadow-pink-300/30 bg-black animate-scale-in"
        style={{ aspectRatio: '3 / 8', maxHeight: '60vh' }}
      >
        <img
          src={photoUrl}
          alt="Photo result"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="flex gap-3 w-full max-w-xs mt-5">
        <button
          onClick={onRetake}
          disabled={sending}
          className="flex-1 rounded-2xl bg-white border border-pink-200 text-ink font-semibold py-3.5 flex items-center justify-center gap-2 transition-all active:scale-95 hover:border-pink-400 disabled:opacity-50"
        >
          <RefreshCw size={18} />
          Retake
        </button>
        <button
          onClick={onSend}
          disabled={sending}
          className="flex-1 rounded-2xl pink-gradient text-white font-semibold py-3.5 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-pink-400/30 disabled:opacity-70"
        >
          {sending ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send size={18} />
              Send My Moments
            </>
          )}
        </button>
      </div>
    </div>
  );
}
