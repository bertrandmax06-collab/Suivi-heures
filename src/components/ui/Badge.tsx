
interface BadgeProps {
  color: string;
  label: string;
  size?: 'sm' | 'md';
}

export function Badge({ color, label, size = 'md' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      style={{ backgroundColor: color + '22', color }}
    >
      <span
        className="rounded-full shrink-0"
        style={{ width: size === 'sm' ? 5 : 6, height: size === 'sm' ? 5 : 6, backgroundColor: color }}
      />
      {label}
    </span>
  );
}
