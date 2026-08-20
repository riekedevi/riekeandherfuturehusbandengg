export type View = 'booth' | 'moments';

export type CaptureMode = 'photo' | 'video';

export type MediaType = 'photo' | 'video';

export interface Moment {
  id: string;
  type: MediaType;
  src: string;
  thumbnail: string;
  createdAt: number;
  templateId: string;
  duration?: number;
}

export interface Template {
  id: string;
  name: string;
  bg: string;
  accent: string;
  text: string;
  frame: string;
  label: string;
  showNames: boolean;
}

export interface CapturedPhoto {
  dataUrl: string;
}

export type FacingMode = 'user' | 'environment';
