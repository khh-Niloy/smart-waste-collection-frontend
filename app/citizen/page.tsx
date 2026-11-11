'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FilePlus2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';
import {
  PriorityBadge,
  StatusBadge,
} from '@/components/reports/status-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusAlert } from '@/components/ui/status-alert';
import { useAuth } from '@/contexts/auth-context';
import { getApiErrorMessage } from '@/lib/api';
import { CATEGORY_META, formatShortDate } from '@/lib/formatters';
import { reportsService } from '@/services/reports.service';
import { CitizenSummary } from '@/types/domain';

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<CitizenSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'CITIZEN') return;
    let active = true;
    const loadSummary = async () => {
      try {
        const data = await reportsService.getMySummary();
        if (active) {
          setSummary(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            getApiErrorMessage(err, 'Unable to load your complaint summary.'),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    void loadSummary();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['CITIZEN']}>
      <AppShell
        title="Citizen Dashboard"
        subtitle={`Welcome back, ${user?.fullName ?? 'Resident'}`}
        action={
          <Link
            href="/citizen/report"
            className="inline-flex h-9 items-center gap-2 rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white transition-colors hover:bg-[#14482e]"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>Report Waste Problem</span>
          </Link>
        }
      >
        <div className="max-w-5xl space-y-8">
          {error && <StatusAlert variant="error" message={error} />}

          {/* Ruled Summary Strip */}
          <div className="grid grid-cols-2 divide-y divide-[#dddad1] border-y border-[#dddad1] bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            <div className="p-4 sm:px-6 sm:py-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Total Reports
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#171a17]">
                {loading ? '—' : (summary?.total ?? 0)}
              </p>
            </div>
            <div className="p-4 sm:px-6 sm:py-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Pending
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#6d4c0f]">
                {loading ? '—' : (summary?.pending ?? 0)}
              </p>
            </div>
            <div className="p-4 sm:px-6 sm:py-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                In Progress
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1b5e3c]">
                {loading ? '—' : (summary?.inProgress ?? 0)}
              </p>
            </div>
            <div className="p-4 sm:px-6 sm:py-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Resolved
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#133826]">
                {loading ? '—' : (summary?.resolved ?? 0)}
              </p>
            </div>
          </div>

          {/* Recent Complaints */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#171a17]">
                  Recent Complaints
                </h2>
                <p className="text-xs text-[#5a5f59]">
                  Latest waste issues submitted from your account
                </p>
              </div>
              <Link
                href="/citizen/complaints"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1b5e3c] hover:text-[#14482e]"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-sm border border-[#dddad1] bg-white">
              {loading ? (
                <div className="px-5">
                  <LoadingSpinner label="Loading recent reports..." />
                </div>
              ) : !summary || summary.recentReports.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm font-medium text-[#171a17]">
                    No waste reports submitted yet
                  </p>
                  <p className="mt-1 text-sm text-[#5a5f59]">
                    Submit your first sanitation issue so municipal crews can
                    respond.
                  </p>
                  <Link
                    href="/citizen/report"
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white hover:bg-[#14482e]"
                  >
                    <FilePlus2 className="h-4 w-4" />
                    <span>Report Waste Problem</span>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#dddad1] bg-[#faf9f6] font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                        <th className="px-4 py-2.5 font-medium">Tracking ID</th>
                        <th className="px-4 py-2.5 font-medium">Category</th>
                        <th className="px-4 py-2.5 font-medium">Priority</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                        <th className="px-4 py-2.5 font-medium">Submitted</th>
                        <th className="px-4 py-2.5 text-right font-medium">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eceae3]">
                      {summary.recentReports.map((report) => (
                        <tr
                          key={report._id}
                          className="transition-colors hover:bg-[#faf9f6]"
                        >
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-[#171a17]">
                            {report.reportCode}
                          </td>
                          <td className="px-4 py-3 text-[#171a17]">
                            {CATEGORY_META[report.category].shortLabel}
                          </td>
                          <td className="px-4 py-3">
                            <PriorityBadge priority={report.priority} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={report.status} />
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#5a5f59]">
                            {formatShortDate(report.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/citizen/complaints/${report._id}`}
                              className="text-xs font-medium text-[#1b5e3c] underline underline-offset-4 hover:text-[#14482e]"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
