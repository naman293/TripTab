import { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`paper-card card-pop p-4 ${className}`}>{children}</section>;
}
