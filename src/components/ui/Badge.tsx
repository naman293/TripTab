import { ReactNode } from 'react';

export function Badge({ children, tone = 'cream' }: { children: ReactNode; tone?: 'cream' | 'cyan' | 'olive' | 'coral' }) {
  const classes = {
    cream: 'bg-offwhite',
    cyan: 'bg-cyanpop',
    olive: 'bg-olivepop text-offwhite',
    coral: 'bg-coralpop'
  };

  return (
    <span className={`inline-flex items-center rounded-full border-[3px] border-ink px-2 py-0.5 text-xs font-extrabold ${classes[tone]}`}>
      {children}
    </span>
  );
}
