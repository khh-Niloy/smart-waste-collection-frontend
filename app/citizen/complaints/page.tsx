'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  FileWarning,
  LayoutGrid,
  RefreshCw,
  Search,
  Trash2,
  Truck,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusAlert } from '@/components/ui/status-alert';
import { useAuth } from '@/contexts/auth-context';
import { getApiErrorMessage } from '@/lib/api';
import {
  CATEGORY_META,
  formatShortDate,
  STATUS_META,
} from '@/lib/formatters';
import { reportsService } from '@/services/reports.service';
import {
  CitizenSummary,
  PaginatedResponse,
  ReportPriority,
  ReportStatus,
  WasteCategory,
  WasteReport,
} from '@/types/domain';

function getCategoryVisual(category: WasteCategory) {
  switch (category) {
    case 'OVERFLOWING_GARBAGE_BIN':
      return {
        icon: Trash2,
        color: 'text-[#d97706]',
        bg: 'bg-[#fef3c7]',
      };
    case 'ILLEGAL_WASTE_DUMPING':
      return {
        icon: AlertTriangle,
        color: 'text-[#ca8a04]',
        bg: 'bg-[#fef9c3]',
      };
    case 'MISSED_WASTE_COLLECTION':
      return {
        icon: Truck,
        color: 'text-[#16a34a]',
        bg: 'bg-[#dcfce7]',
      };
    case 'HAZARDOUS_WASTE':
      return {
        icon: FileWarning,
        color: 'text-[#dc2626]',
        bg: 'bg-[#fee2e2]',
      };
    default:
      return {
        icon: LayoutGrid,
        color: 'text-[#7c3aed]',
        bg: 'bg-[#ede9fe]',
      };
  }
}

function getPriorityPill(priority: ReportPriority) {
  switch (priority) {
    case 'URGENT':
      return { label: 'Urgent', className: 'bg-[#fee2e2] text-[#b91c1c]' };
    case 'HIGH':
      return { label: 'High', className: 'bg-[#ffedd5] text-[#c2410c]' };
    case 'NORMAL':
      return { label: 'Normal', className: 'bg-[#fef3c7] text-[#b45309]' };
    default:
      return { label: 'Low', className: 'bg-[#dcfce7] text-[#15803d]' };
  }
}

function getStatusPill(status: ReportStatus) {
  switch (status) {
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        className: 'bg-[#e3f1fe] text-[#2563eb]',
      };
    case 'RESOLVED':
      return { label: 'Resolved', className: 'bg-[#e2f7ea] text-[#15803d]' };
    case 'REJECTED':
      return { label: 'Rejected', className: 'bg-[#fee2e2] text-[#b91c1c]' };
    default:
      return { label: 'Pending', className: 'bg-[#fef3d6] text-[#b45309]' };
  }
}

function MyComplaintsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<WasteCategory | ''>('');
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);

  const [summary, setSummary] = useState<CitizenSummary | null>(null);
  const [data, setData] = useState<PaginatedResponse<WasteReport> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'CITIZEN') return;
    let active = true;
    void reportsService
      .getMySummary('all')
      .then((res) => {
        if (active) setSummary(res);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    let active = true;
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await reportsService.getMyReports({
          page,
          limit: 5,
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
    }, 180);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [page, search, category, status, sortOrder]);

  const totalCount = data?.meta.total ?? 0;
  const currentPage = data?.meta.page ?? 1;
  const totalPages = data?.meta.totalPages ?? 1;
  const startRow = totalCount === 0 ? 0 : (currentPage - 1) * 5 + 1;
  const endRow = Math.min(currentPage * 5, totalCount);

  return (
    <ProtectedRoute allowedRoles={['CITIZEN']}>
      <AppShell>
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#daf3e2] text-[#16793d]">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-[#143322]">
                My Complaints
              </h1>
              <p className="text-sm text-[#5d6d64]">
                Track status, priority, and assigned collection teams for your
                reports.
              </p>
            </div>
          </div>

          {/* 4 KPI Summary Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="flex items-center justify-between rounded-xl border border-[#e5ece8] bg-white p-4 shadow-[0_2px_10px_rgba(16,42,28,0.04)]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f7ee] text-[#1d9a48]">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xl font-bold tabular-nums text-[#14231b]">
                    {summary?.total ?? 0}
                  </p>
                  <p className="text-xs font-medium text-[#64746c]">
                    Total Reports
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#e7f8ed] px-2 py-0.5 text-[11px] font-semibold text-[#15803d]">
                ↑ 100%
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#e5ece8] bg-white p-4 shadow-[0_2px_10px_rgba(16,42,28,0.04)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fef5e2] text-[#d99b16]">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-bold tabular-nums text-[#14231b]">
                  {summary?.pending ?? 0}
                </p>
                <p className="text-xs font-medium text-[#64746c]">Pending</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#e5ece8] bg-white p-4 shadow-[0_2px_10px_rgba(16,42,28,0.04)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3fe] text-[#2f80ed]">
                <RefreshCw className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-bold tabular-nums text-[#14231b]">
                  {summary?.inProgress ?? 0}
                </p>
                <p className="text-xs font-medium text-[#64746c]">
                  In Progress
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#e5ece8] bg-white p-4 shadow-[0_2px_10px_rgba(16,42,28,0.04)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f8ed] text-[#1d9a48]">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-bold tabular-nums text-[#14231b]">
                  {summary?.resolved ?? 0}
                </p>
                <p className="text-xs font-medium text-[#64746c]">Resolved</p>
              </div>
            </div>
          </div>

          {error && <StatusAlert variant="error" message={error} />}

          {/* Main Complaints Table Card */}
          <div className="rounded-xl border border-[#e5ece8] bg-white p-5 shadow-[0_2px_10px_rgba(16,42,28,0.04)]">
            {/* Search & Filters */}
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
              <div className="relative lg:col-span-5">
                <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[#86968d]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by report code or location..."
                  className="h-9 w-full rounded-lg border border-[#dce4df] bg-[#f7faf8] pr-3 pl-9 text-xs text-[#14231b] placeholder:text-[#86968d] focus:border-[#249f50] focus:bg-white focus:outline-none"
                />
              </div>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as WasteCategory | '');
                  setPage(1);
                }}
                aria-label="Filter by category"
                className="h-9 rounded-lg border border-[#dce4df] bg-white px-3 text-xs font-medium text-[#35463c] focus:border-[#249f50] focus:outline-none lg:col-span-3"
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
                className="h-9 rounded-lg border border-[#dce4df] bg-white px-3 text-xs font-medium text-[#35463c] focus:border-[#249f50] focus:outline-none lg:col-span-2"
              >
                <option value="">All Statuses</option>
                {(Object.keys(STATUS_META) as ReportStatus[]).map((key) => (
                  <option key={key} value={key}>
                    {STATUS_META[key].label}
                  </option>
                ))}
              </select>

              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as 'asc' | 'desc');
                  setPage(1);
                }}
                aria-label="Sort by date"
                className="h-9 rounded-lg border border-[#dce4df] bg-white px-3 text-xs font-medium text-[#35463c] focus:border-[#249f50] focus:outline-none lg:col-span-2"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* Table */}
            {loading ? (
              <LoadingSpinner label="Loading complaints..." />
            ) : !data || data.items.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#64746c]">
                No complaints match your current search or filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs sm:text-[13px]">
                  <thead>
                    <tr className="bg-[#f6f9f7] text-[#5d6d64]">
                      <th className="rounded-l-lg px-3.5 py-2.5 font-semibold">
                        Report Code
                      </th>
                      <th className="px-3.5 py-2.5 font-semibold">Category</th>
                      <th className="px-3.5 py-2.5 font-semibold">Location</th>
                      <th className="px-3.5 py-2.5 font-semibold">Priority</th>
                      <th className="px-3.5 py-2.5 font-semibold">Status</th>
                      <th className="px-3.5 py-2.5 font-semibold">Date</th>
                      <th className="rounded-r-lg px-3.5 py-2.5 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3ef]">
                    {data.items.map((report) => {
                      const catVis = getCategoryVisual(report.category);
                      const CatIcon = catVis.icon;
                      const priorityPill = getPriorityPill(report.priority);
                      const statusPill = getStatusPill(report.status);
                      return (
                        <tr
                          key={report._id}
                          className="transition-colors hover:bg-[#fafcfa]"
                        >
                          <td className="px-3.5 py-3 font-semibold text-[#14231b] whitespace-nowrap">
                            {report.reportCode}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-md ${catVis.bg} ${catVis.color}`}
                              >
                                <CatIcon className="h-3.5 w-3.5" />
                              </span>
                              <span className="font-medium text-[#14231b]">
                                {CATEGORY_META[report.category].shortLabel}
                              </span>
                            </div>
                          </td>
                          <td className="max-w-[180px] truncate px-3.5 py-3 text-[#5d6d64]">
                            {report.address}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${priorityPill.className}`}
                            >
                              {priorityPill.label}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusPill.className}`}
                            >
                              {statusPill.label}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-[#5d6d64] whitespace-nowrap">
                            {formatShortDate(report.createdAt)}
                          </td>
                          <td className="px-3.5 py-3 text-right">
                            <Link
                              href={`/citizen/complaints/${report._id}`}
                              aria-label={`View ${report.reportCode}`}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#dce4df] bg-white text-[#495b51] hover:bg-[#f4f7f5]"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eef3ef] pt-4 text-xs text-[#5d6d64]">
              <span>
                Showing {startRow}–{endRow} of {totalCount} reports
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(1)}
                  aria-label="First page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dce4df] bg-white text-[#495b51] hover:bg-[#f4f7f5] disabled:opacity-40"
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dce4df] bg-white text-[#495b51] hover:bg-[#f4f7f5] disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .slice(
                    Math.max(0, currentPage - 2),
                    Math.min(totalPages, currentPage + 2),
                  )
                  .map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPage(num)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                        num === currentPage
                          ? 'bg-[#1b8a44] text-white'
                          : 'border border-[#dce4df] bg-white text-[#35463c] hover:bg-[#f4f7f5]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dce4df] bg-white text-[#495b51] hover:bg-[#f4f7f5] disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(totalPages)}
                  aria-label="Last page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dce4df] bg-white text-[#495b51] hover:bg-[#f4f7f5] disabled:opacity-40"
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

export default function MyComplaintsPage() {
  return (
    <Suspense
      fallback={<LoadingSpinner fullScreen label="Loading complaints..." />}
    >
      <MyComplaintsContent />
    </Suspense>
  );
}
