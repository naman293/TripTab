export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="paper-card flex flex-col items-center gap-2 bg-offwhite p-6 text-center">
      <div className="h-14 w-14 rounded-full border-[3px] border-ink bg-cyanpop text-3xl leading-[50px]">✷</div>
      <h3 className="brand-font text-lg font-extrabold">{title}</h3>
      <p className="max-w-[34ch] text-sm font-bold opacity-80">{body}</p>
    </div>
  );
}
