import { useMemo } from "react";

export function FloatingPetals({ count = 18 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: -Math.random() * 14,
        dur: 12 + Math.random() * 14,
        drift: (Math.random() - 0.5) * 200,
        size: 8 + Math.random() * 14,
        hue: 18 + Math.random() * 28,
        key: i,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {petals.map((p) => (
        <span
          key={p.key}
          className="animate-petal absolute top-0 block rounded-[60%_40%_55%_45%/55%_45%_60%_40%] opacity-70 blur-[0.3px]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.7,
            animationDelay: `${p.delay}s`,
            ["--dur" as string]: `${p.dur}s`,
            ["--drift" as string]: `${p.drift}px`,
            background: `radial-gradient(ellipse at 30% 30%, oklch(0.94 0.05 ${p.hue}) 0%, oklch(0.82 0.1 ${p.hue}) 70%, transparent 100%)`,
          }}
        />
      ))}
    </div>
  );
}
