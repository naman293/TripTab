import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'yellow' | 'cyan' | 'olive' | 'cream' | 'coral';
  full?: boolean;
};

const toneClass = {
  yellow: 'bg-mustard',
  cyan: 'bg-cyanpop',
  olive: 'bg-olivepop text-offwhite',
  cream: 'bg-cream',
  coral: 'bg-coralpop'
};

export function Button({ tone = 'yellow', full, className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`brutal-btn px-4 py-2 text-sm font-extrabold tracking-[0.01em] ${toneClass[tone]} ${full ? 'w-full' : ''} ${className}`}
    />
  );
}
