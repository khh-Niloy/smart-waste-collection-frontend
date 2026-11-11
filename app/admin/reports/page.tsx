'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';
import {
  PriorityBadge,
  StatusBadge,
} from '@/components/reports/status-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusAlert } from '@/components/ui/status-alert';
import { getApiErrorMessage } from '@/lib/api';
import {
  CATEGORY_META,
  formatShortDate,
  PRIORITY_META,
  STATUS_META,
} from '@/lib/formatters';
import { reportsService } from '@/services/reports.service';
import { teamsService } from '@/services/teams.service';
import {
  CollectionTeam,
  PaginatedResponse,
  ReportPriority,
  ReportStatus,
  WasteCategory,
  WasteReport,
} from '@/types/domain';

export default function AdminReportsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [category, setCategory] = useState<WasteCategory | ''>('');
  const [priority, setPriority] = useState<ReportPriority | ''>('');
  const [assignedTeamId, setAssignedTeamId] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'status'>(
    'createdAt',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [teams, setTeams] = useState<CollectionTeam[]>([]);
  const [data, setData] = useState<PaginatedResponse<WasteReport> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void teamsService
      .list()
      .then(setTeams)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await reportsService.getAllForAdmin({
          page,
          limit: 12,
          search: search.trim() || undefined,
          status,
          category,
          priority,
          assignedTeamId: assignedTeamId || undefined,
          serviceArea: serviceArea.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortBy,
          sortOrder,
        });
        if (active) {
          setData(res);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, 'Unable to load waste reports.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void fetchReports();
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    page,
    search,
    status,
    category,
    priority,
    assignedTeamId,
    serviceArea,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    setPriority('');
    setAssignedTeamId('');
    setServiceArea('');
    setStartDate('');
    setEndDate('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell
        title="All Reports"
        subtitle="Search, filter, prioritize, and dispatch municipal collection teams"
      >
        <div className="max-w-7xl space-y-5">
          {/* Search & Filters */}
          <div className="space-y-3 rounded-sm border border-[#dddad1] bg-white p-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[#8c908a]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search tracking #, citizen name, address, or description..."
                  className="h-9 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] pr-3 pl-9 text-sm focus:border-[#1b5e3c] focus:outline-none"
                />
              </div>

              <input
                type="text"
                value={serviceArea}
                onChange={(e) => {
                  setServiceArea(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by team service area..."
                className="h-9 rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm focus:border-[#1b5e3c] focus:outline-none"
              />

              <select
                value={assignedTeamId}
                onChange={(e) => {
                  setAssignedTeamId(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by assigned team"
                className="h-9 rounded-sm border border-[#d1cec4] bg-white px-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
              >
                <option value="">All Teams</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.teamName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ReportStatus | '');
                  setPage(1);
                }}
                aria-label="Filter by status"
                className="h-9 rounded-sm border border-[#d1cec4] bg-white px-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
              >
                <option value="">All Statuses</option>
                {(Object.keys(STATUS_META) as ReportStatus[]).map((k) => (
                  <option key={k} value={k}>
                    {STATUS_META[k].label}
                  </option>
                ))}
              </select>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as WasteCategory | '');
                  setPage(1);
                }}
                aria-label="Filter by category"
                className="h-9 rounded-sm border border-[#d1cec4] bg-white px-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
              >
                <option value="">All Categories</option>
                {(Object.keys(CATEGORY_META) as WasteCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_META[k].shortLabel}
                  </option>
                ))}
              </select>

              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value as ReportPriority | '');
                  setPage(1);
                }}
                aria-label="Filter by priority"
                className="h-9 rounded-sm border border-[#d1cec4] bg-white px-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
              >
                <option value="">All Priorities</option>
                {(Object.keys(PRIORITY_META) as ReportPriority[]).map((k) => (
                  <option key={k} value={k}>
                    {PRIORITY_META[k].label}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                aria-label="Start date"
                className="h-9 rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-2.5 text-xs focus:border-[#1b5e3c] focus:outline-none"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                aria-label="End date"
                className="h-9 rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-2.5 text-xs focus:border-[#1b5e3c] focus:outline-none"
              />

              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [f, o] = e.target.value.split(':');
                  setSortBy(f as 'createdAt' | 'priority' | 'status');
                  setSortOrder(o as 'asc' | 'desc');
                  setPage(1);
                }}
                aria-label="Sort reports"
                className="h-9 rounded-sm border border-[#d1cec4] bg-white px-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
              >
                <option value="createdAt:desc">Newest first</option>
                <option value="createdAt:asc">Oldest first</option>
                <option value="priority:desc">Priority (Z–A)</option>
                <option value="status:asc">Status (A–Z)</option>
              </select>

              <button
                type="button"
                onClick={clearFilters}
                className="h-9 rounded-sm border border-[#d1cec4] bg-white px-3 text-xs font-medium text-[#171a17] hover:bg-[#faf9f6]"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {error && <StatusAlert variant="error" message={error} />}

          {/* Reports Table */}
          <div className="overflow-hidden rounded-sm border border-[#dddad1] bg-white">
            {loading ? (
              <div className="px-5">
                <LoadingSpinner label="Querying reports..." />
              </div>
            ) : !data || data.items.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-[#5a5f59]">
                No waste reports match your active filters.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#dddad1] bg-[#faf9f6] font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                      <th className="px-4 py-2.5 font-medium">Tracking #</th>
                      <th className="px-4 py-2.5 font-medium">Citizen</th>
                      <th className="px-4 py-2.5 font-medium">Category</th>
                      <th className="px-4 py-2.5 font-medium">Location</th>
                      <th className="px-4 py-2.5 font-medium">Priority</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 font-medium">Assigned Team</th>
                      <th className="px-4 py-2.5 font-medium">Submitted</th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceae3]">
                    {data.items.map((report) => {
                      const citizenName =
                        typeof report.citizenId === 'object' && report.citizenId
                          ? report.citizenId.fullName
                          : '—';
                      const teamName =
                        typeof report.assignedTeamId === 'object' &&
                        report.assignedTeamId
                          ? report.assignedTeamId.teamName
                          : 'Unassigned';
                      return (
                        <tr key={report._id} className="hover:bg-[#faf9f6]">
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-[#171a17]">
                            {report.reportCode}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-[#171a17]">
                            {citizenName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-[#5a5f59]">
                            {CATEGORY_META[report.category].shortLabel}
                          </td>
                          <td className="max-w-[180px] truncate px-4 py-3 text-[#5a5f59]">
                            {report.address}
                          </td>
                          <td className="px-4 py-3">
                            <PriorityBadge priority={report.priority} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={report.status} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-[#5a5f59]">
                            {teamName}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#5a5f59] whitespace-nowrap">
                            {formatShortDate(report.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <Link
                              href={`/admin/reports/${report._id}`}
                              className="text-xs font-medium text-[#1b5e3c] underline underline-offset-4 hover:text-[#14482e]"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[#5a5f59]">
              <span className="font-mono">
                Page {data.meta.page} of {data.meta.totalPages} (
                {data.meta.total} reports)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={data.meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 rounded-sm border border-[#d1cec4] bg-white px-3 font-medium text-[#171a17] disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={data.meta.page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 rounded-sm border border-[#d1cec4] bg-white px-3 font-medium text-[#171a17] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

