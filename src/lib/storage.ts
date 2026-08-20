import type { Moment } from '@/types';

const STORAGE_KEY = 'rieke-moments:v2';

export function loadMoments(): Moment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Moment[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((m) => m && m.id && m.type && m.src);
  } catch {
    return [];
  }
}

export function saveMoments(moments: Moment[]): void {
  try {
    // Only keep metadata + thumbnails in localStorage to avoid quota issues;
    // full photo/video blobs stay in memory for the session.
    const lightweight = moments.slice(0, 60).map((m) =>
      m.type === 'photo'
        ? { ...m, src: m.thumbnail || m.src }
        : { ...m, src: '', thumbnail: m.thumbnail || '' },
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
  } catch {
    // storage may be full; ignore
  }
}

export function createMomentId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadBlobUrl(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
