import { EVENT, getTemplate } from './event';
import type { FrameVariant } from '@/types';

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

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

const COL_W = 540;
const COL_H = 1440;
const PADDING = 36;
const GAP = 18;

interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
}

const layouts: Record<number, Slot[]> = {
  1: [{ x: PADDING, y: 130, w: COL_W - PADDING * 2, h: COL_H - 260 }],
  2: [
    { x: PADDING, y: 130, w: COL_W - PADDING * 2, h: (COL_H - 260 - GAP) / 2 },
    { x: PADDING, y: 130 + (COL_H - 260 - GAP) / 2 + GAP, w: COL_W - PADDING * 2, h: (COL_H - 260 - GAP) / 2 },
  ],
  3: [
    { x: PADDING, y: 130, w: COL_W - PADDING * 2, h: (COL_H - 260 - GAP) / 2 },
    { x: PADDING, y: 130 + (COL_H - 260 - GAP) / 2 + GAP, w: (COL_W - PADDING * 2 - GAP) / 2, h: (COL_H - 260 - GAP) / 2 },
    { x: PADDING + (COL_W - PADDING * 2 - GAP) / 2 + GAP, y: 130 + (COL_H - 260 - GAP) / 2 + GAP, w: (COL_W - PADDING * 2 - GAP) / 2, h: (COL_H - 260 - GAP) / 2 },
  ],
  4: [
    { x: PADDING, y: 130, w: (COL_W - PADDING * 2 - GAP) / 2, h: (COL_H - 260 - GAP) / 2 },
    { x: PADDING + (COL_W - PADDING * 2 - GAP) / 2 + GAP, y: 130, w: (COL_W - PADDING * 2 - GAP) / 2, h: (COL_H - 260 - GAP) / 2 },
    { x: PADDING, y: 130 + (COL_H - 260 - GAP) / 2 + GAP, w: (COL_W - PADDING * 2 - GAP) / 2, h: (COL_H - 260 - GAP) / 2 },
    { x: PADDING + (COL_W - PADDING * 2 - GAP) / 2 + GAP, y: 130 + (COL_H - 260 - GAP) / 2 + GAP, w: (COL_W - PADDING * 2 - GAP) / 2, h: (COL_H - 260 - GAP) / 2 },
  ],
};

function drawDotsPattern(ctx: CanvasRenderingContext2D, color: string, alpha: number) {
  ctx.save();
  ctx.fillStyle = rgba(color, alpha);
  for (let y = 0; y < COL_H; y += 22) {
    for (let x = 0; x < COL_W; x += 22) {
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawCornerFlourish(ctx: CanvasRenderingContext2D, color: string, size: number) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  const corners = [
    [12, 12, 1, 1],
    [COL_W - 12, 12, -1, 1],
    [12, COL_H - 12, 1, -1],
    [COL_W - 12, COL_H - 12, -1, -1],
  ];
  for (const [cx, cy, sx, sy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + size * sy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + size * sx, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 8 * sx, cy + 8 * sy, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();
}

function drawTape(ctx: CanvasRenderingContext2D, x: number, w: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,180,0.65)';
  const tapeW = 60;
  const tapeH = 22;
  ctx.translate(x + w / 2, 8);
  ctx.rotate(-0.08);
  ctx.fillRect(-tapeW / 2, -tapeH / 2, tapeW, tapeH);
  ctx.strokeStyle = 'rgba(200,180,100,0.3)';
  ctx.lineWidth = 1;
  for (let i = -tapeW / 2; i < tapeW / 2; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, -tapeH / 2);
    ctx.lineTo(i, tapeH / 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFrameForVariant(
  ctx: CanvasRenderingContext2D,
  variant: FrameVariant,
  slot: Slot,
  template: { frame: string; accent: string; bg: string },
  isLast: boolean,
) {
  const r = 16;

  switch (variant) {
    case 'plain':
      // No border at all — photos bleed to the edge of the slot
      break;

    case 'thin':
      ctx.save();
      roundRect(ctx, slot.x, slot.y, slot.w, slot.h, r);
      ctx.strokeStyle = template.frame;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
      break;

    case 'thick':
      ctx.save();
      roundRect(ctx, slot.x - 6, slot.y - 6, slot.w + 12, slot.h + 12, r + 6);
      ctx.strokeStyle = template.frame;
      ctx.lineWidth = 12;
      ctx.stroke();
      ctx.restore();
      break;

    case 'polaroid': {
      const bottomExtra = isLast ? 50 : 24;
      ctx.save();
      ctx.fillStyle = template.frame;
      roundRect(
        ctx,
        slot.x - 8,
        slot.y - 8,
        slot.w + 16,
        slot.h + 8 + bottomExtra,
        6,
      );
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'double':
      ctx.save();
      roundRect(ctx, slot.x, slot.y, slot.w, slot.h, r);
      ctx.strokeStyle = template.frame;
      ctx.lineWidth = 3;
      ctx.stroke();
      roundRect(ctx, slot.x + 6, slot.y + 6, slot.w - 12, slot.h - 12, r - 4);
      ctx.strokeStyle = rgba(template.accent, 0.6);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      break;

    case 'gradient': {
      ctx.save();
      roundRect(ctx, slot.x, slot.y, slot.w, slot.h, r);
      const grad = ctx.createLinearGradient(slot.x, slot.y, slot.x + slot.w, slot.y + slot.h);
      grad.addColorStop(0, template.frame);
      grad.addColorStop(0.5, template.accent);
      grad.addColorStop(1, template.frame);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'dots':
      ctx.save();
      roundRect(ctx, slot.x, slot.y, slot.w, slot.h, r);
      ctx.strokeStyle = template.frame;
      ctx.lineWidth = 4;
      ctx.setLineDash([2, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      break;

    case 'shadow':
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = template.bg;
      roundRect(ctx, slot.x - 4, slot.y - 4, slot.w + 8, slot.h + 8, r + 4);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = template.frame;
      ctx.lineWidth = 2;
      roundRect(ctx, slot.x - 4, slot.y - 4, slot.w + 8, slot.h + 8, r + 4);
      ctx.stroke();
      ctx.restore();
      break;

    case 'tape':
      ctx.save();
      ctx.strokeStyle = rgba('#cccccc', 0.6);
      ctx.lineWidth = 2;
      roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 4);
      ctx.stroke();
      // washi tape on top-left of each photo
      ctx.fillStyle = 'rgba(255,200,180,0.7)';
      const tw = 50;
      const th = 18;
      ctx.save();
      ctx.translate(slot.x + 20, slot.y - 4);
      ctx.rotate(-0.1);
      ctx.fillRect(-tw / 2, -th / 2, tw, th);
      ctx.restore();
      ctx.restore();
      break;

    case 'art':
      ctx.save();
      roundRect(ctx, slot.x, slot.y, slot.w, slot.h, r);
      ctx.strokeStyle = template.frame;
      ctx.lineWidth = 4;
      ctx.stroke();
      // decorative corner brackets
      const cs = 18;
      ctx.lineWidth = 3;
      ctx.strokeStyle = template.accent;
      for (const [cx, cy, sx, sy] of [
        [slot.x, slot.y, 1, 1],
        [slot.x + slot.w, slot.y, -1, 1],
        [slot.x, slot.y + slot.h, 1, -1],
        [slot.x + slot.w, slot.y + slot.h, -1, -1],
      ] as const) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + cs * sy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + cs * sx, cy);
        ctx.stroke();
      }
      ctx.restore();
      break;
  }
}

function clipPhoto(ctx: CanvasRenderingContext2D, slot: Slot, variant: FrameVariant) {
  const r = variant === 'polaroid' || variant === 'plain' ? 4 : 16;
  roundRect(ctx, slot.x, slot.y, slot.w, slot.h, r);
  ctx.clip();
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  template: { text: string; accent: string; label: string },
  variant: FrameVariant,
) {
  ctx.textAlign = 'center';

  if (variant === 'art') {
    ctx.font = '700 26px "Playfair Display", Georgia, serif';
    ctx.fillStyle = template.text;
    ctx.fillText(EVENT.title.toUpperCase(), COL_W / 2, 70);
    ctx.strokeStyle = template.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(COL_W / 2 - 90, 82);
    ctx.lineTo(COL_W / 2 + 90, 82);
    ctx.stroke();
    ctx.font = '400 15px Poppins, sans-serif';
    ctx.fillStyle = template.accent;
    ctx.fillText('— ENGAGEMENT MOMENTS —', COL_W / 2, 104);
    return;
  }

  if (variant === 'gradient' || variant === 'shadow') {
    ctx.font = '600 28px "Playfair Display", Georgia, serif';
    ctx.fillStyle = template.text;
    ctx.fillText(EVENT.title, COL_W / 2, 75);
    ctx.font = '400 16px Poppins, sans-serif';
    ctx.fillStyle = template.accent;
    ctx.fillText(template.label, COL_W / 2, 105);
    return;
  }

  ctx.font = '600 30px "Playfair Display", Georgia, serif';
  ctx.fillStyle = template.text;
  ctx.fillText(EVENT.title, COL_W / 2, 80);
  ctx.font = '400 18px Poppins, sans-serif';
  ctx.fillStyle = template.accent;
  ctx.fillText(template.label, COL_W / 2, 112);
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  template: { text: string; accent: string; showNames: boolean; label: string },
) {
  ctx.textAlign = 'center';
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
}

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

  // Variant-specific background decorations
  if (template.variant === 'dots') {
    drawDotsPattern(ctx, template.accent, 0.12);
  }
  if (template.variant === 'art') {
    drawDotsPattern(ctx, template.accent, 0.08);
  }
  if (template.variant === 'gradient') {
    const bgGrad = ctx.createLinearGradient(0, 0, COL_W, COL_H);
    bgGrad.addColorStop(0, template.bg);
    bgGrad.addColorStop(0.5, '#2a1a3e');
    bgGrad.addColorStop(1, template.bg);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, COL_W, COL_H);
  }

  const flip = captureMode === 'user';
  const n = validImages.length;
  const slots = layouts[n] ?? layouts[1];

  // For polaroid: draw the white card first, then clip photo on top
  slots.forEach((slot, i) => {
    const img = validImages[i];
    if (!img) return;

    // Draw frame background (for polaroid/shadow/tape which need card behind photo)
    if (template.variant === 'polaroid') {
      const bottomExtra = i === slots.length - 1 ? 50 : 24;
      ctx.save();
      ctx.fillStyle = template.frame;
      roundRect(ctx, slot.x - 8, slot.y - 8, slot.w + 16, slot.h + 8 + bottomExtra, 6);
      ctx.fill();
      ctx.restore();
    }
    if (template.variant === 'shadow') {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = template.bg;
      roundRect(ctx, slot.x - 4, slot.y - 4, slot.w + 8, slot.h + 8, 20);
      ctx.fill();
      ctx.restore();
    }

    // Clip and draw the photo
    ctx.save();
    clipPhoto(ctx, slot, template.variant);
    drawImageCover(ctx, img, slot.x, slot.y, slot.w, slot.h, flip);
    ctx.restore();

    // Draw the frame border on top
    drawFrameForVariant(ctx, template.variant, slot, template, i === slots.length - 1);
  });

  // Header
  drawHeader(ctx, template, template.variant);

  // Decorative corners for art variant
  if (template.variant === 'art') {
    drawCornerFlourish(ctx, template.accent, 22);
  }

  // Footer
  drawFooter(ctx, template);

  return canvas.toDataURL('image/jpeg', 0.92);
}

export { getTemplate };
