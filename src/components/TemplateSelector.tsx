import { templates } from '@/lib/event';
import type { FrameVariant } from '@/types';

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

function previewStyle(variant: FrameVariant, frame: string, accent: string, bg: string): React.CSSProperties {
  const base: React.CSSProperties = { background: bg };
  switch (variant) {
    case 'plain':
      return base;
    case 'thin':
      return { ...base, border: `2px solid ${frame}` };
    case 'thick':
      return { ...base, border: `5px solid ${frame}` };
    case 'polaroid':
      return { ...base, border: `2px solid ${frame}`, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' };
    case 'double':
      return { ...base, border: `2px solid ${frame}`, outline: `1px solid ${accent}`, outlineOffset: '-5px' };
    case 'gradient':
      return { ...base, border: `2px solid transparent`, backgroundImage: `linear-gradient(135deg, ${bg}, #2a1a3e), linear-gradient(135deg, ${frame}, ${accent})`, backgroundClip: 'padding-box, border-box', backgroundOrigin: 'border-box' };
    case 'dots':
      return { ...base, border: `2px dashed ${frame}` };
    case 'shadow':
      return { ...base, border: `1px solid ${frame}`, boxShadow: '0 3px 10px rgba(0,0,0,0.4)' };
    case 'tape':
      return { ...base, border: `1px solid #ccc`, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' };
    case 'art':
      return { ...base, border: `2px solid ${frame}`, boxShadow: `inset 0 0 0 3px ${bg}, inset 0 0 0 4px ${accent}` };
    default:
      return base;
  }
}

export default function TemplateSelector({ selectedId, onSelect }: TemplateSelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <span className="text-xs font-medium text-ink/50 shrink-0 mr-1">Frame</span>
      {templates.map((t) => {
        const active = t.id === selectedId;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`group relative shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
              active
                ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-cream scale-105'
                : 'ring-1 ring-pink-200 opacity-70 hover:opacity-100'
            }`}
            style={{ width: 44, height: 44, ...previewStyle(t.variant, t.frame, t.accent, t.bg) }}
            title={t.name}
            aria-label={t.name}
          >
            <span
              className="absolute bottom-0.5 left-0 right-0 text-center text-[7px] font-bold"
              style={{ color: t.accent }}
            >
              {t.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
