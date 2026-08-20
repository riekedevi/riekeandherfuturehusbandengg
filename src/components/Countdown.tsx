import { useEffect, useState } from 'react';

interface CountdownProps {
  onDone: () => void;
}

export default function Countdown({ onDone }: CountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c - 1), 900);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-black/30 backdrop-blur-[2px]">
      <div
        key={count}
        className="font-display text-8xl font-bold text-white drop-shadow-2xl animate-pop"
      >
        {count === 0 ? (
          <span className="text-5xl">SMILE! 📸</span>
        ) : (
          count
        )}
      </div>
    </div>
  );
}
