import { templates } from '@/lib/event';

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
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
            className={`group relative shrink-0 rounded-xl overflow-hidden transition-all duration-200 ${
              active ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-cream scale-105' : 'ring-1 ring-pink-200'
            }`}
            style={{ width: 44, height: 44, background: t.bg }}
            title={t.name}
            aria-label={t.name}
          >
            <span
              className="absolute inset-1 rounded-md"
              style={{ border: `2px solid ${t.frame}` }}
            />
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
