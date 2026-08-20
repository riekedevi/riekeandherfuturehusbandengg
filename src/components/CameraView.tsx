import { useEffect, useRef, useState } from 'react';
import { CameraOff, SwitchCamera } from 'lucide-react';
import type { CaptureMode, FacingMode } from '@/types';
import { EVENT } from '@/lib/event';
import { formatDuration } from '@/lib/media';

interface CameraViewProps {
  stream: MediaStream | null;
  facingMode: FacingMode;
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMsg: string;
  mode: CaptureMode;
  recording: boolean;
  elapsed: number;
  hasMultipleCameras: boolean;
  onSwitchCamera: () => void;
  onShutter: () => void;
  onToggleRecord: () => void;
  recordingSupported: boolean;
}

export default function CameraView({
  stream,
  facingMode,
  status,
  errorMsg,
  mode,
  recording,
  elapsed,
  hasMultipleCameras,
  onSwitchCamera,
  onShutter,
  onToggleRecord,
  recordingSupported,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (stream && video.srcObject !== stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    }
  }, [stream]);

  // Keep audio tracks enabled/disabled based on recording
  useEffect(() => {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((t) => {
      t.enabled = true;
    });
  }, [stream, recording]);

  function triggerFlash() {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
  }

  // Expose flash to parent via a custom event trick — simpler: handle shutter locally
  function handleShutterClick() {
    triggerFlash();
    onShutter();
  }

  const flip = facingMode === 'user';

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          status === 'ready' ? 'opacity-100' : 'opacity-0'
        } ${flip ? 'scale-x-[-1]' : ''}`}
      />

      {/* Loading */}
      {status === 'loading' && (
        <div className="absolute inset-0 grid place-items-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
            <p className="text-sm text-white/70">Starting camera…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="absolute inset-0 grid place-items-center bg-black px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <CameraOff size={40} className="text-white/40" />
            <p className="text-sm text-white/80 max-w-xs">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Idle */}
      {status === 'idle' && (
        <div className="absolute inset-0 grid place-items-center bg-black">
          <p className="text-sm text-white/50">Camera is off</p>
        </div>
      )}

      {/* Framing overlay */}
      {status === 'ready' && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-4 sm:inset-6 rounded-3xl border-2 border-white/20" />
        </div>
      )}

      {/* Event branding overlay */}
      {status === 'ready' && (
        <div className="pointer-events-none absolute top-4 left-0 right-0 flex flex-col items-center">
          <span className="font-display text-lg font-semibold text-white drop-shadow-lg">
            {EVENT.title}
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/80 drop-shadow">
            {EVENT.subtitle}
          </span>
        </div>
      )}

      {/* Flash */}
      {flash && <div className="absolute inset-0 bg-white animate-fade-in z-40" />}

      {/* Recording indicator */}
      {recording && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur px-3 py-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse-rec" />
          <span className="text-xs font-bold text-white tabular-nums">
            REC {formatDuration(elapsed)}
          </span>
        </div>
      )}

      {/* Switch camera */}
      {status === 'ready' && hasMultipleCameras && (
        <button
          onClick={onSwitchCamera}
          className="absolute top-4 left-4 z-20 grid place-items-center h-10 w-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white transition-transform active:scale-90"
          aria-label="Switch camera"
        >
          <SwitchCamera size={18} />
        </button>
      )}

      {/* Capture controls */}
      {status === 'ready' && (
        <div className="absolute bottom-0 inset-x-0 z-20 pb-6 safe-bottom flex flex-col items-center gap-3">
          {mode === 'photo' ? (
            <button
              onClick={handleShutterClick}
              className="group relative grid place-items-center h-20 w-20 rounded-full transition-transform active:scale-90"
              aria-label="Take photo"
            >
              <span className="absolute inset-0 rounded-full border-4 border-white/90" />
              <span className="h-14 w-14 rounded-full bg-white transition-all group-active:scale-75 group-active:bg-pink-400" />
            </button>
          ) : recordingSupported ? (
            <button
              onClick={onToggleRecord}
              className="group relative grid place-items-center h-20 w-20 rounded-full transition-transform active:scale-90"
              aria-label={recording ? 'Stop recording' : 'Start recording'}
            >
              {recording ? (
                <>
                  <span className="absolute inset-0 rounded-full border-4 border-white/90" />
                  <span className="h-8 w-8 rounded-lg bg-red-500 transition-all" />
                </>
              ) : (
                <>
                  <span className="absolute inset-0 rounded-full border-4 border-white/90" />
                  <span className="h-14 w-14 rounded-full bg-red-500 transition-all group-active:scale-75" />
                </>
              )}
            </button>
          ) : (
            <p className="text-xs text-white/70 bg-black/50 rounded-full px-4 py-2">
              Video recording is not supported in this browser.
            </p>
          )}

          {mode === 'video' && !recording && recordingSupported && (
            <p className="text-xs text-white/80 bg-black/40 backdrop-blur rounded-full px-4 py-1.5">
              Ready to capture your moment?
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Utility exported for the orchestrator to capture a frame from the video element
export function captureFromVideo(
  video: HTMLVideoElement,
  flip: boolean,
): string | null {
  if (!video.videoWidth) return null;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  if (flip) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.92);
}
