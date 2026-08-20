import { useEffect, useRef, useState } from 'react';
import type { FacingMode } from '@/types';

interface CameraState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMsg: string;
  stream: MediaStream | null;
  hasMultipleCameras: boolean;
}

export function useCameraStream(facingMode: FacingMode, enabled: boolean) {
  const [state, setState] = useState<CameraState>({
    status: 'idle',
    errorMsg: '',
    stream: null,
    hasMultipleCameras: false,
  });
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!enabled) return;
      setState((s) => ({ ...s, status: 'loading' }));

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: true,
        };
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch {
          // Retry without audio (mic may be denied)
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode } },
            audio: false,
          });
        }
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        // Detect multiple cameras
        let multi = false;
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cams = devices.filter((d) => d.kind === 'videoinput');
          multi = cams.length > 1;
        } catch {
          multi = false;
        }

        setState({
          status: 'ready',
          errorMsg: '',
          stream,
          hasMultipleCameras: multi,
        });
      } catch (err) {
        if (cancelled) return;
        const e = err as DOMException;
        let msg = 'Camera access is unavailable on this device. Please check your browser permissions and try again.';
        if (e.name === 'NotAllowedError') {
          msg = 'Camera access was denied. Please allow camera access in your browser settings and try again.';
        } else if (e.name === 'NotFoundError' || e.name === 'OverconstrainedError') {
          msg = 'No camera found on this device. Please connect a camera and try again.';
        } else if (e.name === 'NotReadableError') {
          msg = 'The camera is in use by another app. Close it and try again.';
        }
        setState({ status: 'error', errorMsg: msg, stream: null, hasMultipleCameras: false });
      }
    }

    start();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode, enabled]);

  return { ...state };
}
