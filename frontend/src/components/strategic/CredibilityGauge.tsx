type Props = {
  value: number;
  label?: string;
  size?: number;
};

export default function CredibilityGauge({ value, label = "فجوة المصداقية", size = 140 }: Props) {
  const clamped = Math.min(100, Math.max(0, value));
  const color = clamped > 60 ? "#F58E7C" : clamped > 35 ? "#C66E4E" : "#22c55e";
  const r = (size - 16) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth={10} className="text-bg-deep dark:text-ink/50" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="mt-[-90px] text-center" style={{ width: size }}>
        <p className="text-3xl font-black" style={{ color }}>{clamped}%</p>
        <p className="text-[10px] text-ink-faint">{label}</p>
      </div>
    </div>
  );
}
