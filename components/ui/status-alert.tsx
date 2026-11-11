'use client';

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface StatusAlertProps {
  variant?: 'error' | 'success' | 'info';
  message: string;
}

export function StatusAlert({
  variant = 'error',
  message,
}: StatusAlertProps) {
  const styles = {
    error: 'border-l-2 border-l-red-700 border-[#e7d4d2] bg-[#fdf6f5] text-[#7f1d1d]',
    success:
      'border-l-2 border-l-[#1b5e3c] border-[#cfe0d5] bg-[#f1f7f3] text-[#133826]',
    info: 'border-l-2 border-l-[#5a5f59] border-[#dddad1] bg-[#faf9f6] text-[#171a17]',
  }[variant];

  const Icon = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
  }[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-sm border px-3.5 py-2.5 text-sm leading-snug ${styles}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
