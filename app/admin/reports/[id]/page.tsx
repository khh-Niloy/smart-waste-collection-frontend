'use client';

import { FormEvent, Suspense, use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ImageOff, MapPin, Phone, Truck, User } from 'lucide-react';
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
import {
  ALLOWED_STATUS_TRANSITIONS,
  CATEGORY_META,
  formatDateTime,
  PRIORITY_META,
  STATUS_META,
} from '@/lib/formatters';
import { reportsService } from '@/services/reports.service';
import { teamsService } from '@/services/teams.service';
import {
  CollectionTeam,
  ReportPriority,
  ReportStatus,
  WasteReport,
} from '@/types/domain';

function AdminReportDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<WasteReport | null>(null);
  const [activeTeams, setActiveTeams] = useState<CollectionTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [nextStatus, setNextStatus] = useState<ReportStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assigningTeam, setAssigningTeam] = useState(false);

  const [overridePriority, setOverridePriority] =
    useState<ReportPriority>('HIGH');
  const [overrideReason, setOverrideReason] = useState('');
  const [overridingPriority, setOverridingPriority] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      try {
        const [reportData, teamsData] = await Promise.all([
          reportsService.getById(id),
          teamsService.list({ isActive: 'true' }),
        ]);
        if (!active) return;
        setReport(reportData);
        setActiveTeams(teamsData);
        const allowed = ALLOWED_STATUS_TRANSITIONS[reportData.status] || [];
        setNextStatus(allowed[0] || '');
        if (
          reportData.assignedTeamId &&
          typeof reportData.assignedTeamId === 'object'
        ) {
          setSelectedTeamId(reportData.assignedTeamId._id);
        }
        setOverridePriority(reportData.priority);
        setError(null);
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, 'Unable to load report details.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    void fetchInitial();
    return () => {
      active = false;
    };
  }, [id]);

  const handleStatusUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!nextStatus || !report) return;
    setActionError(null);
    setActionMessage(null);

    if (nextStatus === 'REJECTED' && !statusNote.trim()) {
      setActionError('A rejection reason note is required.');
      return;
    }

    setUpdatingStatus(true);
    try {
      const updated = await reportsService.updateStatus(report._id, {
        status: nextStatus,
        note: statusNote.trim() || undefined,
      });
      setReport(updated);
      const allowed = ALLOWED_STATUS_TRANSITIONS[updated.status] || [];
      setNextStatus(allowed[0] || '');
      setStatusNote('');
      setActionMessage(`Status updated to ${STATUS_META[updated.status].label}.`);
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to update status.'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignTeam = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !report) {
      setActionError('Please select an active collection team.');
      return;
    }
    setActionError(null);
    setActionMessage(null);
    setAssigningTeam(true);
    try {
      const updated = await reportsService.assignTeam(report._id, {
        teamId: selectedTeamId,
        note: assignNote.trim() || undefined,
      });
      setReport(updated);
      const allowed = ALLOWED_STATUS_TRANSITIONS[updated.status] || [];
      setNextStatus(allowed[0] || '');
      setAssignNote('');
      setActionMessage('Collection team assigned successfully.');
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to assign team.'));
    } finally {
      setAssigningTeam(false);
    }
  };

  const handleOverridePriority = async (e: FormEvent) => {
    e.preventDefault();
    if (!report) return;
    setActionError(null);
    setActionMessage(null);

    if (overrideReason.trim().length < 5) {
      setActionError(
        'Please provide a clear override reason (at least 5 characters).',
      );
      return;
    }

    setOverridingPriority(true);
    try {
      const updated = await reportsService.overridePriority(report._id, {
        priority: overridePriority,
        reason: overrideReason.trim(),
      });
      setReport(updated);
      setOverrideReason('');
      setActionMessage(
        `Priority overridden to ${PRIORITY_META[updated.priority].label}.`,
      );
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to override priority.'));
    } finally {
      setOverridingPriority(false);
    }
  };

  const citizen =
    report?.citizenId && typeof report.citizenId === 'object'
      ? report.citizenId
      : null;
  const assignedTeam =
    report?.assignedTeamId && typeof report.assignedTeamId === 'object'
      ? report.assignedTeamId
      : null;
  const validNextStatuses = report
    ? ALLOWED_STATUS_TRANSITIONS[report.status] || []
    : [];

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell
        title={report ? `Report ${report.reportCode}` : 'Manage Report'}
        subtitle={
          report
            ? `${CATEGORY_META[report.category].label} · Submitted ${formatDateTime(report.createdAt)}`
            : 'Loading waste report...'
        }
        action={
          <Link
            href="/admin/reports"
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-[#d1cec4] bg-white px-3.5 text-sm font-medium text-[#171a17] hover:bg-[#faf9f6]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Reports</span>
          </Link>
        }
      >
        {loading ? (
          <LoadingSpinner label="Loading report operations..." />
        ) : error ? (
          <StatusAlert variant="error" message={error} />
        ) : report ? (
          <div className="max-w-6xl space-y-6">
            {actionMessage && (
              <StatusAlert variant="success" message={actionMessage} />
            )}
            {actionError && (
              <StatusAlert variant="error" message={actionError} />
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left 2 cols: Info, Photo, Timeline */}
              <div className="space-y-6 lg:col-span-2">
                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eceae3] pb-4">
                    <div>
                      <p className="font-mono text-xs font-semibold text-[#171a17]">
                        {report.reportCode}
                      </p>
                      <p className="text-sm font-medium text-[#5a5f59]">
                        {CATEGORY_META[report.category].label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={report.priority} />
                      <StatusBadge status={report.status} />
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                        Description
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[#171a17]">
                        {report.description}
                      </p>
                    </div>

                    <div className="grid gap-4 border-t border-[#eceae3] pt-4 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1b5e3c]" />
                        <div className="text-sm">
                          <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                            Location
                          </p>
                          <p className="mt-0.5 font-medium text-[#171a17]">
                            {report.address}
                          </p>
                          {report.latitude !== null &&
                            report.latitude !== undefined &&
                            report.longitude !== null &&
                            report.longitude !== undefined && (
                              <p className="mt-0.5 font-mono text-xs text-[#5a5f59]">
                                {report.latitude}, {report.longitude}
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-[#5a5f59]" />
                        <div className="text-sm">
                          <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                            Reported By
                          </p>
                          <p className="mt-0.5 font-medium text-[#171a17]">
                            {citizen?.fullName || 'Citizen'}
                          </p>
                          <p className="font-mono text-xs text-[#5a5f59]">
                            {citizen?.email}
                          </p>
                          {citizen?.phone && (
                            <p className="font-mono text-xs text-[#5a5f59]">
                              {citizen.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Photograph */}
                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Waste-Site Photograph
                  </h2>
                  {report.photoPreviewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={report.photoPreviewUrl}
                      alt={`Waste site for ${report.reportCode}`}
                      className="mt-3 max-h-80 w-full rounded-sm border border-[#eceae3] object-cover"
                    />
                  ) : (
                    <div className="mt-3 flex items-center gap-3 rounded-sm border border-dashed border-[#d1cec4] bg-[#faf9f6] p-6 text-sm text-[#5a5f59]">
                      <ImageOff className="h-5 w-5 shrink-0" />
                      <span>
                        {report.photoUrl
                          ? 'Photograph stored in Supabase; configure SUPABASE_URL & SUPABASE_SECRET_KEY to generate signed previews.'
                          : 'No waste-site photograph was attached to this report.'}
                      </span>
                    </div>
                  )}
                </section>

                {/* Timeline */}
                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Collection Status Timeline
                  </h2>
                  <StatusTimeline
                    currentStatus={report.status}
                    history={report.statusHistory}
                  />
                </section>
              </div>

              {/* Right Column: Operations */}
              <div className="space-y-6">
                {/* 1. Update Status */}
                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Update Collection Status
                  </h2>
                  {validNextStatuses.length === 0 ? (
                    <p className="mt-3 text-sm text-[#5a5f59]">
                      This report is in a terminal state (
                      <strong>{STATUS_META[report.status].label}</strong>) and
                      cannot transition further.
                    </p>
                  ) : (
                    <form onSubmit={handleStatusUpdate} className="mt-3 space-y-3">
                      <div>
                        <label
                          htmlFor="nextStatus"
                          className="block text-xs font-medium text-[#5a5f59]"
                        >
                          Next Valid Status
                        </label>
                        <select
                          id="nextStatus"
                          value={nextStatus}
                          onChange={(e) =>
                            setNextStatus(e.target.value as ReportStatus)
                          }
                          className="mt-1 h-9 w-full rounded-sm border border-[#d1cec4] bg-white px-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
                        >
                          {validNextStatuses.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_META[s].label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="statusNote"
                          className="block text-xs font-medium text-[#5a5f59]"
                        >
                          {nextStatus === 'REJECTED'
                            ? 'Rejection Reason (Required)'
                            : 'Operational Note (Optional)'}
                        </label>
                        <textarea
                          id="statusNote"
                          rows={2}
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          placeholder={
                            nextStatus === 'REJECTED'
                              ? 'Explain why this report is rejected...'
                              : 'Add an audit note...'
                          }
                          className="mt-1 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] p-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={updatingStatus}
                        className="h-9 w-full rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white hover:bg-[#14482e] disabled:opacity-60"
                      >
                        {updatingStatus ? 'Updating...' : 'Update Status'}
                      </button>
                    </form>
                  )}
                </section>

                {/* 2. Assign Collection Team */}
                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Collection Team Assignment
                  </h2>

                  {assignedTeam && (
                    <div className="mt-3 rounded-sm border border-[#cfe0d5] bg-[#f1f7f3] p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[#133826]">
                        <Truck className="h-3.5 w-3.5" />
                        <span>{assignedTeam.teamName}</span>
                      </div>
                      <p className="mt-1 text-[#5a5f59]">
                        Area: {assignedTeam.serviceArea}
                      </p>
                      <p className="flex items-center gap-1 font-mono text-[#171a17]">
                        <Phone className="h-3 w-3" />
                        <span>{assignedTeam.phone}</span>
                      </p>
                    </div>
                  )}

                  {report.status === 'RESOLVED' ||
                  report.status === 'REJECTED' ? (
                    <p className="mt-3 text-xs text-[#5a5f59]">
                      Team assignment is locked for closed reports.
                    </p>
                  ) : (
                    <form onSubmit={handleAssignTeam} className="mt-3 space-y-3">
                      <div>
                        <label
                          htmlFor="teamSelect"
                          className="block text-xs font-medium text-[#5a5f59]"
                        >
                          Active Collection Team
                        </label>
                        <select
                          id="teamSelect"
                          value={selectedTeamId}
                          onChange={(e) => setSelectedTeamId(e.target.value)}
                          className="mt-1 h-9 w-full rounded-sm border border-[#d1cec4] bg-white px-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
                        >
                          <option value="">Select active team...</option>
                          {activeTeams.map((team) => (
                            <option key={team._id} value={team._id}>
                              {team.teamName} — {team.serviceArea} (
                              {team.activeWorkloadCount ?? 0} active)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="assignNote"
                          className="block text-xs font-medium text-[#5a5f59]"
                        >
                          Dispatch Note (Optional)
                        </label>
                        <input
                          id="assignNote"
                          type="text"
                          value={assignNote}
                          onChange={(e) => setAssignNote(e.target.value)}
                          placeholder="Instructions for crew..."
                          className="mt-1 h-9 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={assigningTeam || activeTeams.length === 0}
                        className="h-9 w-full rounded-sm border border-[#133826] bg-[#133826] px-4 text-sm font-medium text-white hover:bg-[#0e2a1c] disabled:opacity-60"
                      >
                        {assigningTeam ? 'Assigning...' : 'Assign Team'}
                      </button>
                    </form>
                  )}
                </section>

                {/* 3. Priority Classification & Admin Override */}
                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Priority &amp; Rule Assessment
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-[#5a5f59]">
                    {report.priorityReason}
                  </p>
                  {report.matchedRule && (
                    <p className="mt-1 font-mono text-[11px] text-[#8c908a]">
                      Rule: {report.matchedRule}
                    </p>
                  )}

                  <form
                    onSubmit={handleOverridePriority}
                    className="mt-4 space-y-3 border-t border-[#eceae3] pt-4"
                  >
                    <div>
                      <label
                        htmlFor="overridePriority"
                        className="block text-xs font-medium text-[#5a5f59]"
                      >
                        Override Priority
                      </label>
                      <select
                        id="overridePriority"
                        value={overridePriority}
                        onChange={(e) =>
                          setOverridePriority(e.target.value as ReportPriority)
                        }
                        className="mt-1 h-9 w-full rounded-sm border border-[#d1cec4] bg-white px-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
                      >
                        {(Object.keys(PRIORITY_META) as ReportPriority[]).map(
                          (p) => (
                            <option key={p} value={p}>
                              {PRIORITY_META[p].label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="overrideReason"
                        className="block text-xs font-medium text-[#5a5f59]"
                      >
                        Override Reason (Required)
                      </label>
                      <input
                        id="overrideReason"
                        type="text"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="Justification for priority change..."
                        className="mt-1 h-9 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={overridingPriority}
                      className="h-9 w-full rounded-sm border border-[#d1cec4] bg-white px-4 text-sm font-medium text-[#171a17] hover:bg-[#faf9f6] disabled:opacity-60"
                    >
                      {overridingPriority
                        ? 'Saving Override...'
                        : 'Override Priority'}
                    </button>
                  </form>

                  {report.priorityHistory && report.priorityHistory.length > 0 && (
                    <div className="mt-4 border-t border-[#eceae3] pt-3">
                      <p className="font-mono text-[10px] uppercase text-[#5a5f59]">
                        Priority Override Log
                      </p>
                      <ul className="mt-2 space-y-2 text-xs">
                        {report.priorityHistory.map((entry, idx) => (
                          <li key={idx} className="text-[#5a5f59]">
                            <span className="font-mono font-medium text-[#171a17]">
                              {entry.previousPriority} → {entry.newPriority}
                            </span>{' '}
                            — {entry.reason} ({formatDateTime(entry.changedAt)})
                          </li>
                        ))}
                      </ul>
                    </div>
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

export default function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<LoadingSpinner fullScreen label="Loading report..." />}
    >
      <AdminReportDetailContent params={params} />
    </Suspense>
  );
}
