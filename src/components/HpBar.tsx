export function HpBar({ hp, maxHp }: { hp: number; maxHp: number }) {
  const percent = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  return (
    <div className="h-4 overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}
