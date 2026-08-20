interface PhotoCountSelectorProps {
  count: number;
  onChange: (count: number) => void;
}

const options = [1, 2, 3, 4];

export default function PhotoCountSelector({ count, onChange }: PhotoCountSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-ink/50 mr-1">Shots</span>
      {options.map((n) => {
        const active = count === n;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-9 w-9 rounded-xl text-sm font-bold transition-all duration-200 ${
              active
                ? 'pink-gradient text-white shadow-md shadow-pink-400/30 scale-105'
                : 'bg-white text-ink/60 border border-pink-200 hover:border-pink-400'
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
