import { Camera } from 'lucide-react';

interface PermissionGateProps {
  onEnable: () => void;
  error?: string;
}

export default function PermissionGate({ onEnable, error }: PermissionGateProps) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-cream pink-gradient-soft p-6">
      <div className="flex flex-col items-center text-center max-w-sm animate-fade-in-up">
        <div className="grid place-items-center h-24 w-24 rounded-full pink-gradient shadow-xl shadow-pink-300/40 mb-6 animate-pop">
          <Camera size={40} className="text-white" strokeWidth={2} />
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          Ready to capture a moment?
        </h2>
        <p className="mt-3 text-ink/70 text-sm leading-relaxed">
          Allow camera access to start the photobooth.{' '}
          {error ? '' : 'For video mode, microphone access lets you record sound too.'}
        </p>

        {error && (
          <div className="mt-5 w-full rounded-2xl bg-pink-100 border border-pink-200 px-4 py-3 text-sm text-pink-700 text-left">
            {error}
          </div>
        )}

        <button
          onClick={onEnable}
          className="mt-6 w-full rounded-2xl pink-gradient text-white font-semibold py-4 px-6 shadow-lg shadow-pink-400/30 transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-pink-400/40"
        >
          Enable Camera
        </button>
      </div>
    </div>
  );
}
