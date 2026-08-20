import { EVENT, getTemplate } from './event';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  flip = false,
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;

  ctx.save();
  if (flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, w - dx - dw, dy, dw, dh);
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  ctx.restore();
}

const COL_W = 540;
const COL_H = 1440;
const PADDING = 36;
const GAP = 18;

export async function renderCollage({
  templateId,
  photos,
  captureMode,
}: {
  templateId: string;
  photos: string[];
  captureMode: 'user' | 'environment';
}): Promise<string> {
  const template = getTemplate(templateId);
  const images = await Promise.all(
    photos.map((p) => loadImage(p).catch(() => null)),
  );
  const validImages = images.filter((i): i is HTMLImageElement => i !== null);
  if (validImages.length === 0) return photos[0] ?? '';

  const canvas = document.createElement('canvas');
  canvas.width = COL_W;
  canvas.height = COL_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return photos[0] ?? '';

  // Background
  ctx.fillStyle = template.bg;
  ctx.fillRect(0, 0, COL_W, COL_H);

  // Decorative top/bottom band
  const bandH = 150;
  ctx.fillStyle = template.bg;
  ctx.fillRect(0, 0, COL_W, bandH);
  ctx.fillRect(0, COL_H - bandH, COL_W, bandH);

  // Frame border
  ctx.strokeStyle = template.frame;
  ctx.lineWidth = 6;
  ctx.strokeRect(18, 18, COL_W - 36, COL_H - 36);

  const photoAreaTop = bandH - 20;
  const photoAreaH = COL_H - bandH * 2 + 40;
  const photoAreaW = COL_W - PADDING * 2;
  const flip = captureMode === 'user';

  const n = validImages.length;
  const layouts: Record<number, { x: number; y: number; w: number; h: number }[]> = {
    1: [{ x: PADDING, y: photoAreaTop, w: photoAreaW, h: photoAreaH }],
    2: [
      { x: PADDING, y: photoAreaTop, w: photoAreaW, h: (photoAreaH - GAP) / 2 },
      { x: PADDING, y: photoAreaTop + (photoAreaH - GAP) / 2 + GAP, w: photoAreaW, h: (photoAreaH - GAP) / 2 },
    ],
    3: [
      { x: PADDING, y: photoAreaTop, w: photoAreaW, h: (photoAreaH - GAP) / 2 },
      { x: PADDING, y: photoAreaTop + (photoAreaH - GAP) / 2 + GAP, w: (photoAreaW - GAP) / 2, h: (photoAreaH - GAP) / 2 },
      { x: PADDING + (photoAreaW - GAP) / 2 + GAP, y: photoAreaTop + (photoAreaH - GAP) / 2 + GAP, w: (photoAreaW - GAP) / 2, h: (photoAreaH - GAP) / 2 },
    ],
    4: [
      { x: PADDING, y: photoAreaTop, w: (photoAreaW - GAP) / 2, h: (photoAreaH - GAP) / 2 },
      { x: PADDING + (photoAreaW - GAP) / 2 + GAP, y: photoAreaTop, w: (photoAreaW - GAP) / 2, h: (photoAreaH - GAP) / 2 },
      { x: PADDING, y: photoAreaTop + (photoAreaH - GAP) / 2 + GAP, w: (photoAreaW - GAP) / 2, h: (photoAreaH - GAP) / 2 },
      { x: PADDING + (photoAreaW - GAP) / 2 + GAP, y: photoAreaTop + (photoAreaH - GAP) / 2 + GAP, w: (photoAreaW - GAP) / 2, h: (photoAreaH - GAP) / 2 },
    ],
  };

  const slots = layouts[n] ?? layouts[1];
  slots.forEach((slot, i) => {
    const img = validImages[i];
    if (!img) return;
    const r = 16;
    ctx.save();
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, r);
    ctx.clip();
    drawImageCover(ctx, img, slot.x, slot.y, slot.w, slot.h, flip);
    ctx.restore();
    ctx.strokeStyle = template.frame;
    ctx.lineWidth = 4;
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, r);
    ctx.stroke();
  });

  // Top label
  ctx.fillStyle = template.text;
  ctx.textAlign = 'center';
  ctx.font = '600 30px "Playfair Display", Georgia, serif';
  ctx.fillText(EVENT.title, COL_W / 2, 80);

  ctx.font = '400 18px Poppins, sans-serif';
  ctx.fillStyle = template.accent;
  ctx.fillText(template.label, COL_W / 2, 112);

  // Bottom names
  ctx.fillStyle = template.text;
  ctx.font = '600 26px "Playfair Display", Georgia, serif';
  if (template.showNames) {
    ctx.fillText(EVENT.name1, COL_W / 2 - 70, COL_H - 80);
    ctx.fillText('&', COL_W / 2, COL_H - 80);
    ctx.fillText('Future Husband', COL_W / 2 + 80, COL_H - 80);
  } else {
    ctx.fillText(EVENT.subtitle, COL_W / 2, COL_H - 80);
  }

  ctx.font = '400 15px Poppins, sans-serif';
  ctx.fillStyle = template.accent;
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  ctx.fillText(date, COL_W / 2, COL_H - 48);

  return canvas.toDataURL('image/jpeg', 0.92);
}

export { getTemplate };
