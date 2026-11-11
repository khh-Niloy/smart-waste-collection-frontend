'use client';

import { Suspense, use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Truck } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';
import {
  PriorityBadge,
  StatusBadge,
} from '@/components/reports/status-badge';
import { StatusTimeline } from '@/components/reports/status-timeline';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusAlert } from '@/components/ui/status-alert';
import { getApiErrorMessage } from '@/lib/api';
import { CATEGORY_META, formatDateTime } from '@/lib/formatters';
import { reportsService } from '@/services/reports.service';
import { WasteReport } from '@/types/domain';

function CitizenComplaintDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<WasteReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadDetail = async () => {
      try {
        const data = await reportsService.getById(id);
        if (active) {
          setReport(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            getApiErrorMessage(err, 'Unable to load complaint details.'),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    void loadDetail();
    return () => {
      active = false;
    };
  }, [id]);

  const assignedTeam =
    report?.assignedTeamId && typeof report.assignedTeamId === 'object'
      ? report.assignedTeamId
      : null;

  return (
    <ProtectedRoute allowedRoles={['CITIZEN']}>
      <AppShell
        title={
          report ? `Complaint ${report.reportCode}` : 'Complaint Details'
        }
        subtitle={
          report
            ? `${CATEGORY_META[report.category].label} · Submitted ${formatDateTime(report.createdAt)}`
            : 'Inspecting report status and assignment'
        }
        action={
          <Link
            href="/citizen/complaints"
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-[#d1cec4] bg-white px-3.5 text-sm font-medium text-[#171a17] hover:bg-[#faf9f6]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Complaints</span>
          </Link>
        }
      >
        {loading ? (
          <LoadingSpinner label="Loading complaint details..." />
        ) : error ? (
          <div className="max-w-2xl">
            <StatusAlert variant="error" message={error} />
          </div>
        ) : report ? (
          <div className="max-w-5xl space-y-8">
            {/* Key Metadata Strip */}
            <div className="grid gap-4 border-y border-[#dddad1] bg-white p-5 sm:grid-cols-4">
              <div>
                <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                  Tracking Code
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#171a17]">
                  {report.reportCode}
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                  Category
                </p>
                <p className="mt-1 text-sm font-medium text-[#171a17]">
                  {CATEGORY_META[report.category].label}
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                  Priority
                </p>
                <div className="mt-1">
                  <PriorityBadge priority={report.priority} />
                </div>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                  Current Status
                </p>
                <div className="mt-1">
                  <StatusBadge status={report.status} />
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Description &amp; Location
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#171a17]">
                    {report.description}
                  </p>
                  <div className="mt-4 flex items-start gap-2 border-t border-[#eceae3] pt-4 text-sm text-[#5a5f59]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1b5e3c]" />
                    <div>
                      <p className="font-medium text-[#171a17]">
                        {report.address}
                      </p>
                      {report.latitude !== null &&
                        report.latitude !== undefined &&
                        report.longitude !== null &&
                        report.longitude !== undefined && (
                          <p className="mt-0.5 font-mono text-xs">
                            Coordinates: {report.latitude}, {report.longitude}
                          </p>
                        )}
                    </div>
                  </div>
                </section>

                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Resolution Timeline
                  </h2>
                  <StatusTimeline
                    currentStatus={report.status}
                    history={report.statusHistory}
                  />
                </section>
              </div>

              <div className="space-y-6">
                {/* Priority Explanation */}
                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Priority Assessment
                  </h2>
                  <div className="mt-2">
                    <PriorityBadge priority={report.priority} />
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#5a5f59]">
                    {report.priorityReason}
                  </p>
                  {report.priorityOverrideReason && (
                    <div className="mt-3 border-t border-[#eceae3] pt-3 text-xs text-[#171a17]">
                      <span className="font-mono uppercase text-[#5a5f59]">
                        Admin Override Note:{' '}
                      </span>
                      {report.priorityOverrideReason}
                    </div>
                  )}
                </section>

                {/* Assigned Team */}
                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Assigned Collection Team
                  </h2>
                  {assignedTeam ? (
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2 font-semibold text-[#133826]">
                        <Truck className="h-4 w-4" />
                        <span>{assignedTeam.teamName}</span>
                      </div>
                      <p className="text-[#5a5f59]">
                        Lead: {assignedTeam.contactPerson}
                      </p>
                      <p className="text-[#5a5f59]">
                        Area: {assignedTeam.serviceArea}
                      </p>
                      <p className="flex items-center gap-1.5 font-mono text-xs text-[#171a17]">
                        <Phone className="h-3.5 w-3.5 text-[#5a5f59]" />
                        <span>{assignedTeam.phone}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#5a5f59]">
                      No collection team assigned yet. Municipal dispatchers
                      will assign a crew once reviewed.
                    </p>
                  )}
                </section>

                {/* Waste-site Photograph */}
                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Site Photograph
                  </h2>
                  {report.photoPreviewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={report.photoPreviewUrl}
                      alt={`Site photograph for ${report.reportCode}`}
                      className="mt-3 max-h-64 w-full rounded-sm border border-[#eceae3] object-cover"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-[#5a5f59]">
                      {report.photoUrl
                        ? 'Photograph stored in Supabase; preview URL unavailable.'
                        : 'No photograph attached to this report.'}
                    </p>
                  )}
                </section>
              </div>
            </div>
          </div>
        ) : null}
      </AppShell>
    </ProtectedRoute>
  );
}

export default function CitizenComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<LoadingSpinner fullScreen label="Loading complaint..." />}
    >
      <CitizenComplaintDetailContent params={params} />
    </Suspense>
  );
}
