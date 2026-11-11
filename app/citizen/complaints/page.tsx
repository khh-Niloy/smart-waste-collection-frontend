'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePlus2, Search } from 'lucide-react';
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
  STATUS_META,
} from '@/lib/formatters';
import { reportsService } from '@/services/reports.service';
import {
  PaginatedResponse,
  ReportStatus,
  WasteCategory,
  WasteReport,
} from '@/types/domain';

export default function MyComplaintsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<WasteCategory | ''>('');
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<PaginatedResponse<WasteReport> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await reportsService.getMyReports({
          page,
          limit: 10,
          search: search.trim() || undefined,
          category,
          status,
          sortBy: 'createdAt',
          sortOrder,
        });
        if (active) {
          setData(res);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, 'Unable to load complaints.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    const timer = setTimeout(() => {
      void fetchComplaints();
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [page, search, category, status, sortOrder]);

  const handleClear = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <ProtectedRoute allowedRoles={['CITIZEN']}>
      <AppShell
        title="My Complaints"
        subtitle="Track status, priority, and assigned collection teams for your reports"
        action={
          <Link
            href="/citizen/report"
            className="inline-flex h-9 items-center gap-2 rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white hover:bg-[#14482e]"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>New Report</span>
          </Link>
        }
      >
        <div className="max-w-6xl space-y-5">
          {/* Filters */}
          <div className="grid gap-3 rounded-sm border border-[#dddad1] bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[#8c908a]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search tracking code or address..."
                className="h-9 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] pr-3 pl-9 text-sm focus:border-[#1b5e3c] focus:outline-none"
              />
            </div>

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
              {(Object.keys(CATEGORY_META) as WasteCategory[]).map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_META[key].shortLabel}
                </option>
              ))}
            </select>

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
              {(Object.keys(STATUS_META) as ReportStatus[]).map((key) => (
                <option key={key} value={key}>
                  {STATUS_META[key].label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as 'asc' | 'desc');
                  setPage(1);
                }}
                aria-label="Sort by date"
                className="h-9 flex-1 rounded-sm border border-[#d1cec4] bg-white px-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
              <button
                type="button"
                onClick={handleClear}
                className="h-9 rounded-sm border border-[#d1cec4] px-3 text-xs font-medium text-[#5a5f59] hover:bg-[#faf9f6]"
              >
                Reset
              </button>
            </div>
          </div>

          {error && <StatusAlert variant="error" message={error} />}

          {/* Table */}
          <div className="overflow-hidden rounded-sm border border-[#dddad1] bg-white">
            {loading ? (
              <div className="px-5">
                <LoadingSpinner label="Loading complaints..." />
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[#5a5f59]">
                No complaints match the current search or filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#dddad1] bg-[#faf9f6] font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                      <th className="px-4 py-2.5 font-medium">Tracking #</th>
                      <th className="px-4 py-2.5 font-medium">Category</th>
                      <th className="px-4 py-2.5 font-medium">Description</th>
                      <th className="px-4 py-2.5 font-medium">Address</th>
                      <th className="px-4 py-2.5 font-medium">Priority</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 font-medium">Submitted</th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceae3]">
                    {data.items.map((report) => (
                      <tr key={report._id} className="hover:bg-[#faf9f6]">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-[#171a17]">
                          {report.reportCode}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {CATEGORY_META[report.category].shortLabel}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 text-[#5a5f59]">
                          {report.description}
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
                        <td className="px-4 py-3 font-mono text-xs text-[#5a5f59] whitespace-nowrap">
                          {formatShortDate(report.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Link
                            href={`/citizen/complaints/${report._id}`}
                            className="text-xs font-medium text-[#1b5e3c] underline underline-offset-4 hover:text-[#14482e]"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[#5a5f59]">
              <span className="font-mono">
                Page {data.meta.page} of {data.meta.totalPages} (
                {data.meta.total} total)
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
