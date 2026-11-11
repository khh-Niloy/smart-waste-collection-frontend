'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';
import { StatusAlert } from '@/components/ui/status-alert';
import { useAuth } from '@/contexts/auth-context';
import { formatDateTime } from '@/lib/formatters';

export default function CitizenProfilePage() {
  const { user, refreshUser } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleVerifySession = async () => {
    setVerifying(true);
    setStatusMessage(null);
    try {
      const fresh = await refreshUser();
      if (fresh) {
        setStatusMessage(`Active session confirmed for ${fresh.email}.`);
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['CITIZEN']}>
      <AppShell
        title="Resident Profile"
        subtitle="Account information and session status"
        action={
          <button
            type="button"
            onClick={handleVerifySession}
            disabled={verifying}
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-[#d1cec4] bg-white px-3.5 text-sm font-medium text-[#171a17] hover:bg-[#faf9f6] disabled:opacity-60"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-[#5a5f59] ${verifying ? 'animate-spin' : ''}`}
            />
            <span>{verifying ? 'Verifying...' : 'Verify Session'}</span>
          </button>
        }
      >
        <div className="max-w-3xl space-y-6">
          {statusMessage && (
            <StatusAlert variant="success" message={statusMessage} />
          )}

          <dl className="grid gap-6 border-y border-[#dddad1] bg-white p-6 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Full Name
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#171a17]">
                {user?.fullName}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Email
              </dt>
              <dd className="mt-1 font-mono text-sm text-[#171a17]">
                {user?.email}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Phone
              </dt>
              <dd className="mt-1 font-mono text-sm text-[#171a17]">
                {user?.phone || '—'}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Role &amp; Joined
              </dt>
              <dd className="mt-1 font-mono text-xs text-[#5a5f59]">
                {user?.role} · {formatDateTime(user?.createdAt)}
              </dd>
            </div>
          </dl>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
