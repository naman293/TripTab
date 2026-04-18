import { InputHTMLAttributes } from 'react';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`outlined-input w-full px-3 py-2 text-sm ${className}`} />;
}
