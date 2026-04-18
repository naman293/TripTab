export function AvatarDoodle({ seed, size = 44 }: { seed: number; size?: number }) {
  const skin = ['#FFF5D6', '#FFE8C5', '#F7D4B7'][seed % 3];
  const hair = ['#111111', '#333333', '#575757'][seed % 3];
  const eyeX = 13 + (seed % 3);
  const mouth = 23 + (seed % 3);

  return (
    <div
      className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-offwhite"
      style={{ width: size, height: size }}
      aria-label="Avatar doodle"
    >
      <svg width={size - 8} height={size - 8} viewBox="0 0 36 36" fill="none" aria-hidden>
        <circle cx="18" cy="18" r="17" fill="#fff" stroke="#111" strokeWidth="2" />
        <path d="M8 16c1-5 4-8 10-8s9 3 10 8" fill={hair} stroke="#111" strokeWidth="1.8" />
        <circle cx="18" cy="19" r="8" fill={skin} stroke="#111" strokeWidth="1.8" />
        <circle cx={eyeX} cy="18" r="1.2" fill="#111" />
        <circle cx={36 - eyeX} cy="18" r="1.2" fill="#111" />
        <path d={`M14 ${mouth}c2 2 6 2 8 0`} stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}
