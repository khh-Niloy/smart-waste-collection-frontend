'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  label = 'Loading...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div
      className="flex items-center gap-2.5 text-[#5a5f59]"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-4 w-4 animate-spin text-[#1b5e3c]" />
      <span className="font-mono text-xs uppercase tracking-[0.06em]">
        {label}
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f3ee] p-6">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-start py-6">{content}</div>;
}
