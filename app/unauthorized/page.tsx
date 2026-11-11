'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const dashboardHref = user
    ? user.role === 'ADMIN'
      ? '/admin'
      : '/citizen'
    : '/login';

  return (
    <div className="flex min-h-screen items-center bg-[#f4f3ee] px-6 py-16">
      <div className="mx-auto w-full max-w-lg border-t-2 border-[#133826] pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#7f1d1d]">
          HTTP 403 — Access Restricted
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#171a17]">
          You do not have permission to open this route.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#5a5f59]">
          Your signed-in role does not grant access to this workspace. Return to
          your assigned portal or switch accounts.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={dashboardHref}
            className="inline-flex h-9 items-center rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white transition-colors hover:bg-[#14482e]"
          >
            {user ? 'Return to Portal' : 'Sign In'}
          </Link>
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-sm border border-[#d1cec4] bg-white px-4 text-sm font-medium text-[#171a17] transition-colors hover:bg-[#faf9f6]"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
