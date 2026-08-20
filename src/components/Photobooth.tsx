import { useEffect, useRef, useState } from 'react';
import type { CaptureMode, FacingMode, Moment } from '@/types';
import { useCameraStream } from '@/lib/useCameraStream';
import { renderCollage } from '@/lib/renderCollage';
import {
  pickVideoMime,
  isMediaRecorderSupported,
  extractVideoThumbnail,
  blobToUrl,
} from '@/lib/media';
import { createMomentId } from '@/lib/storage';
import CameraView, { captureFromVideo } from './CameraView';
import PermissionGate from './PermissionGate';
import ModeSelector from './ModeSelector';
import PhotoCountSelector from './PhotoCountSelector';
import TemplateSelector from './TemplateSelector';
import Countdown from './Countdown';
import PhotoResult from './PhotoResult';
import VideoResult from './VideoResult';
import SuccessToast from './SuccessToast';

interface PhotoboothProps {
  onMomentAdded: (moment: Moment) => void;
}

type Phase = 'permission' | 'live' | 'countdown' | 'photo-result' | 'video-result';

export default function Photobooth({ onMomentAdded }: PhotoboothProps) {
  const [enabled, setEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>('user');
  const [mode, setMode] = useState<CaptureMode>('photo');
  const [photoCount, setPhotoCount] = useState(1);
  const [templateId, setTemplateId] = useState('classic');
  const [phase, setPhase] = useState<Phase>('permission');

  const { status, errorMsg, stream, hasMultipleCameras } = useCameraStream(
    facingMode,
    enabled,
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoElForCapture = useRef<HTMLVideoElement | null>(null);

  // Photo capture sequence
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [finalPhoto, setFinalPhoto] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  // Video recording
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoThumb, setVideoThumb] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sending
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const recordingSupported = isMediaRecorderSupported();

  // When enabled and stream ready, move to live
  useEffect(() => {
    if (enabled && status === 'ready' && phase === 'permission') {
      setPhase('live');
    }
    if (status === 'error' && phase !== 'permission') {
      setPhase('permission');
    }
  }, [enabled, status, phase]);

  // Keep a reference to the video element for capture
  useEffect(() => {
    videoElForCapture.current = videoRef.current;
  });

  function handleEnable() {
    setEnabled(true);
  }

  function handleSwitchCamera() {
    setFacingMode((m) => (m === 'user' ? 'environment' : 'user'));
  }

  function handleModeChange(next: CaptureMode) {
    if (recording) return;
    setMode(next);
    setPhase('live');
    setCapturedFrames([]);
    setFinalPhoto(null);
    setVideoBlobUrl(null);
  }

  // --- PHOTO FLOW ---
  function startPhotoSequence() {
    if (status !== 'ready' || !stream) return;
    setCapturedFrames([]);
    setPhase('countdown');
  }

  function onCountdownDone() {
    // Capture a frame
    const video = videoElForCapture.current;
    if (!video) {
      setPhase('live');
      return;
    }
    const frame = captureFromVideo(video, facingMode === 'user');
    if (frame) {
      setCapturedFrames((prev) => {
        const next = [...prev, frame];
        if (next.length >= photoCount) {
          // All shots captured — render collage
          finalizePhotos(next);
        } else {
          // More shots needed — re-trigger countdown
          setPhase('countdown');
        }
        return next;
      });
    } else {
      setPhase('live');
    }
  }

  async function finalizePhotos(frames: string[]) {
    setRendering(true);
    try {
      const result = await renderCollage({
        templateId,
        photos: frames,
        captureMode: facingMode,
      });
      setFinalPhoto(result);
      setPhase('photo-result');
    } catch {
      setFinalPhoto(frames[0] ?? null);
      setPhase('photo-result');
    } finally {
      setRendering(false);
    }
  }

  function handleRetakePhoto() {
    setCapturedFrames([]);
    setFinalPhoto(null);
    setPhase('live');
  }

  function handleSendPhoto() {
    if (!finalPhoto) return;
    setSending(true);
    setTimeout(() => {
      const moment: Moment = {
        id: createMomentId(),
        type: 'photo',
        src: finalPhoto,
        thumbnail: finalPhoto,
        createdAt: Date.now(),
        templateId,
      };
      onMomentAdded(moment);
      setSending(false);
      setSuccessMsg('Photo sent to Moments! ✨');
      setTimeout(() => {
        setSuccessMsg('');
        handleRetakePhoto();
      }, 1600);
    }, 800);
  }

  // --- VIDEO FLOW ---
  function toggleRecord() {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function startRecording() {
    if (!stream) return;
    const mime = pickVideoMime();
    if (!mime) return;

    // Build a stream: video track from camera + audio track if available
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;
    const audioTracks = stream.getAudioTracks();
    const tracks: MediaStreamTrack[] = [videoTrack, ...audioTracks];
    const recordStream = new MediaStream(tracks);

    try {
      const recorder = new MediaRecorder(recordStream, { mimeType: mime });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = handleRecordingStop;
      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } catch {
      setRecording(false);
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function handleRecordingStop() {
    const mime = pickVideoMime();
    const blob = new Blob(chunksRef.current, { type: mime || 'video/webm' });
    const url = blobToUrl(blob);
    setVideoBlobUrl(url);
    setVideoDuration(elapsed);
    setPhase('video-result');

    const thumb = await extractVideoThumbnail(url);
    setVideoThumb(thumb);
  }

  function handleRetakeVideo() {
    if (videoBlobUrl) {
      URL.revokeObjectURL(videoBlobUrl);
    }
    setVideoBlobUrl(null);
    setVideoDuration(0);
    setVideoThumb('');
    setElapsed(0);
    setPhase('live');
  }

  function handleSendVideo() {
    if (!videoBlobUrl) return;
    setSending(true);
    setTimeout(() => {
      const moment: Moment = {
        id: createMomentId(),
        type: 'video',
        src: videoBlobUrl,
        thumbnail: videoThumb,
        createdAt: Date.now(),
        templateId,
        duration: videoDuration,
      };
      onMomentAdded(moment);
      setSending(false);
      setSuccessMsg('Video sent to Moments! ✨');
      setTimeout(() => {
        setSuccessMsg('');
        handleRetakeVideo();
      }, 1600);
    }, 800);
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Header / controls bar */}
      {phase !== 'permission' && (
        <div className="flex flex-col gap-3 px-4 pt-4 pb-3 bg-cream sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <ModeSelector mode={mode} onChange={handleModeChange} />
            {mode === 'photo' && (
              <PhotoCountSelector count={photoCount} onChange={setPhotoCount} />
            )}
          </div>
          <TemplateSelector selectedId={templateId} onSelect={setTemplateId} />
        </div>
      )}

      {/* Camera stage */}
      <div
        className="relative w-full mx-auto bg-black"
        style={{
          aspectRatio: '3 / 4',
          maxHeight: '70vh',
          maxWidth: 'min(100%, 520px)',
        }}
      >
        {phase === 'permission' && (
          <PermissionGate onEnable={handleEnable} error={enabled ? errorMsg : undefined} />
        )}

        {phase !== 'permission' && (
          <>
            {/* Hidden live video ref for capture */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="hidden"
            />

            {/* Visible camera or result */}
            {(phase === 'live' || phase === 'countdown') && (
              <CameraView
                stream={stream}
                facingMode={facingMode}
                status={status}
                errorMsg={errorMsg}
                mode={mode}
                recording={recording}
                elapsed={elapsed}
                hasMultipleCameras={hasMultipleCameras}
                onSwitchCamera={handleSwitchCamera}
                onShutter={startPhotoSequence}
                onToggleRecord={toggleRecord}
                recordingSupported={recordingSupported}
              />
            )}

            {phase === 'countdown' && (
              <Countdown key={capturedFrames.length} onDone={onCountdownDone} />
            )}

            {phase === 'photo-result' && finalPhoto && (
              <div className="absolute inset-0 bg-cream flex items-center justify-center p-4 overflow-y-auto">
                {rendering ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
                    <p className="text-sm text-ink/60">Applying template…</p>
                  </div>
                ) : (
                  <PhotoResult
                    photoUrl={finalPhoto}
                    onRetake={handleRetakePhoto}
                    onSend={handleSendPhoto}
                    sending={sending}
                  />
                )}
              </div>
            )}

            {phase === 'video-result' && videoBlobUrl && (
              <div className="absolute inset-0 bg-cream flex items-center justify-center p-4 overflow-y-auto">
                <VideoResult
                  videoUrl={videoBlobUrl}
                  duration={videoDuration}
                  onRetake={handleRetakeVideo}
                  onSend={handleSendVideo}
                  sending={sending}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Shot progress (photo sequence) */}
      {phase === 'countdown' && mode === 'photo' && (
        <div className="flex items-center justify-center gap-2 py-2">
          {Array.from({ length: photoCount }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i < capturedFrames.length ? 'bg-pink-500' : 'bg-pink-200'
              }`}
            />
          ))}
        </div>
      )}

      <SuccessToast show={!!successMsg} message={successMsg} />
    </div>
  );
}
