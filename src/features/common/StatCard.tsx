export function StatCard({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: 'cyan' | 'cream' | 'coral' | 'olive';
}) {
  return (
    <div
      className={`paper-card p-3 ${
        tone === 'cyan'
          ? 'bg-cyanpop'
          : tone === 'olive'
            ? 'bg-olivepop text-offwhite'
            : tone === 'coral'
              ? 'bg-coralpop'
              : 'bg-cream'
      }`}
    >
      <div className="text-xs font-bold uppercase tracking-wide">{label}</div>
      <div className="brand-font text-2xl font-extrabold">{value}</div>
    </div>
  );
}
