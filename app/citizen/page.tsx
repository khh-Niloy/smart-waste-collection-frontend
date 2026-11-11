'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FilePlus2,
  FileText,
  FileWarning,
  HelpCircle,
  ListChecks,
  Plus,
  RefreshCw,
  Trash2,
  Truck,
  Zap,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusAlert } from '@/components/ui/status-alert';
import { useAuth } from '@/contexts/auth-context';
import { getApiErrorMessage } from '@/lib/api';
import { CATEGORY_META, formatShortDate } from '@/lib/formatters';
import { reportsService } from '@/services/reports.service';
import {
  CitizenSummary,
  ReportStatus,
  WasteCategory,
} from '@/types/domain';

const CitizenDashboardMap = dynamic(
  () => import('@/components/maps/citizen-dashboard-map'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[206px] items-center justify-center rounded-xl border border-[#e3eae5] bg-[#eef2ef] text-xs font-medium text-[#5d6d64]">
        Loading map...
      </div>
    ),
  },
);

function Sparkline({ stroke, fill }: { stroke: string; fill: string }) {
  return (
    <svg
      viewBox="0 0 88 32"
      className="h-7 w-20 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 28C12 27 18 22 26 22C34 22 40 16 49 17C58 18 65 8 74 9C80 10 83 5 86 3V32H2V28Z"
        fill={fill}
        opacity="0.35"
      />
      <path
        d="M2 28C12 27 18 22 26 22C34 22 40 16 49 17C58 18 65 8 74 9C80 10 83 5 86 3"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
        icon: HelpCircle,
        color: 'text-[#2563eb]',
        bg: 'bg-[#dbeafe]',
      };
  }
}

function getDashboardStatusPill(status: ReportStatus) {
  switch (status) {
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        className: 'bg-[#e3f1fe] text-[#2563eb]',
      };
    case 'RESOLVED':
      return {
        label: 'Resolved',
        className: 'bg-[#e2f7ea] text-[#15803d]',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        className: 'bg-[#fee2e2] text-[#b91c1c]',
      };
    default:
      return {
        label: 'Pending',
        className: 'bg-[#fef3d6] text-[#b45309]',
      };
  }
}

function formatPercent(count: number, total: number): string {
  if (total <= 0) return '0%';
  const raw = (count / total) * 100;
  return Number.isInteger(raw) ? `${raw}%` : `${raw.toFixed(1)}%`;
}

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'month' | 'all'>('all');
  const [summary, setSummary] = useState<CitizenSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'CITIZEN') return;
    let active = true;
    const fetchSummary = async () => {
      try {
        const data = await reportsService.getMySummary(timeframe);
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
    void fetchSummary();
    return () => {
      active = false;
    };
  }, [user, timeframe]);

  const total = summary?.total ?? 0;
  const pending = summary?.pending ?? 0;
  const inProgress = summary?.inProgress ?? 0;
  const resolved = summary?.resolved ?? 0;

  const donutData =
    total > 0
      ? [
          { name: 'Resolved', value: resolved, color: '#2EB85C' },
          { name: 'In Progress', value: inProgress, color: '#4A9CF6' },
          { name: 'Pending', value: pending, color: '#F5C33B' },
        ].filter((d) => d.value > 0)
      : [{ name: 'No Reports', value: 1, color: '#E5ECE8' }];

  return (
    <ProtectedRoute allowedRoles={['CITIZEN']}>
      <AppShell
        title="Citizen Dashboard"
        subtitle={`Welcome back, ${user?.fullName ?? 'Resident'}! 👋`}
        action={
          <Link
            href="/citizen/report"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#16793d] px-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#126232]"
          >
            <Plus className="h-4 w-4" />
            <span>Report Waste Problem</span>
          </Link>
        }
      >
        <div className="space-y-5">
          {error && <StatusAlert variant="error" message={error} />}

          {/* Row 1: 4 KPI Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Total Reports */}
            <div className="flex items-center justify-between rounded-xl border border-[#e5ece8] bg-white p-4 shadow-[0_2px_10px_rgba(16,42,28,0.04)]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e9f7ee] text-[#1d9a48]">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold tabular-nums text-[#14231b]">
                    {loading ? '—' : total}
                  </p>
                  <p className="text-xs font-medium text-[#64746c]">
                    Total Reports
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full bg-[#e7f8ed] px-2 py-0.5 text-[11px] font-semibold text-[#15803d]">
                  ↑ {total > 0 ? '100%' : '0%'}
                </span>
                <Sparkline stroke="#2EB85C" fill="#A7E8BE" />
              </div>
            </div>

            {/* Pending */}
            <div className="flex items-center justify-between rounded-xl border border-[#e5ece8] bg-white p-4 shadow-[0_2px_10px_rgba(16,42,28,0.04)]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fef5e2] text-[#d99b16]">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold tabular-nums text-[#14231b]">
                    {loading ? '—' : pending}
                  </p>
                  <p className="text-xs font-medium text-[#64746c]">Pending</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full bg-[#e7f8ed] px-2 py-0.5 text-[11px] font-semibold text-[#15803d]">
                  ↑ {formatPercent(pending, total)}
                </span>
                <Sparkline stroke="#EAB308" fill="#FDE68A" />
              </div>
            </div>

            {/* In Progress */}
            <div className="flex items-center justify-between rounded-xl border border-[#e5ece8] bg-white p-4 shadow-[0_2px_10px_rgba(16,42,28,0.04)]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf3fe] text-[#2f80ed]">
                  <RefreshCw className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold tabular-nums text-[#14231b]">
                    {loading ? '—' : inProgress}
                  </p>
                  <p className="text-xs font-medium text-[#64746c]">
                    In Progress
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full bg-[#e7f8ed] px-2 py-0.5 text-[11px] font-semibold text-[#15803d]">
                  ↑ {formatPercent(inProgress, total)}
                </span>
                <Sparkline stroke="#4A9CF6" fill="#BFDBFE" />
              </div>
            </div>

            {/* Resolved */}
            <div className="flex items-center justify-between rounded-xl border border-[#e5ece8] bg-white p-4 shadow-[0_2px_10px_rgba(16,42,28,0.04)]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7f8ed] text-[#1d9a48]">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold tabular-nums text-[#14231b]">
                    {loading ? '—' : resolved}
                  </p>
                  <p className="text-xs font-medium text-[#64746c]">Resolved</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full bg-[#e7f8ed] px-2 py-0.5 text-[11px] font-semibold text-[#15803d]">
                  ↑ {formatPercent(resolved, total)}
                </span>
                <Sparkline stroke="#2EB85C" fill="#A7E8BE" />
              </div>
            </div>
          </div>

          {/* Row 2: My Reports Overview + Waste Reports on Map */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* My Reports Overview */}
            <section className="rounded-xl border border-[#e5ece8] bg-white p-5 shadow-[0_2px_10px_rgba(16,42,28,0.04)] lg:col-span-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-[#14231b]">
                  My Reports Overview
                </h2>
                <div className="relative flex items-center">
                  <Calendar className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#5d6d64]" />
                  <select
                    value={timeframe}
                    onChange={(e) =>
                      setTimeframe(e.target.value as 'month' | 'all')
                    }
                    aria-label="Filter report overview timeframe"
                    className="h-8 rounded-lg border border-[#dce4df] bg-white pr-2.5 pl-8 text-xs font-medium text-[#35463c] focus:border-[#249f50] focus:outline-none"
                  >
                    <option value="all">All Time</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <LoadingSpinner label="Loading overview..." />
              ) : (
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <div className="relative h-[186px] w-[186px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={56}
                          outerRadius={80}
                          paddingAngle={total > 0 ? 2 : 0}
                          stroke="none"
                        >
                          {donutData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        {total > 0 && <Tooltip />}
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold tabular-nums text-[#14231b]">
                        {total}
                      </span>
                      <span className="text-xs font-medium text-[#64746c]">
                        Reports
                      </span>
                    </div>
                  </div>

                  <dl className="w-full flex-1 space-y-3.5 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2.5 font-medium text-[#14231b]">
                        <span className="h-3 w-3 rounded-[3px] bg-[#2EB85C]" />
                        <span>Resolved</span>
                      </dt>
                      <dd className="tabular-nums">
                        <span className="font-bold text-[#14231b]">
                          {resolved}
                        </span>{' '}
                        <span className="text-xs text-[#64746c]">
                          ({formatPercent(resolved, total)})
                        </span>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2.5 font-medium text-[#14231b]">
                        <span className="h-3 w-3 rounded-[3px] bg-[#4A9CF6]" />
                        <span>In Progress</span>
                      </dt>
                      <dd className="tabular-nums">
                        <span className="font-bold text-[#14231b]">
                          {inProgress}
                        </span>{' '}
                        <span className="text-xs text-[#64746c]">
                          ({formatPercent(inProgress, total)})
                        </span>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2.5 font-medium text-[#14231b]">
                        <span className="h-3 w-3 rounded-[3px] bg-[#F5C33B]" />
                        <span>Pending</span>
                      </dt>
                      <dd className="tabular-nums">
                        <span className="font-bold text-[#14231b]">
                          {pending}
                        </span>{' '}
                        <span className="text-xs text-[#64746c]">
                          ({formatPercent(pending, total)})
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </section>

            {/* Waste Reports on Map */}
            <section className="rounded-xl border border-[#e5ece8] bg-white p-5 shadow-[0_2px_10px_rgba(16,42,28,0.04)] lg:col-span-7">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#14231b]">
                  Waste Reports on Map
                </h2>
              </div>

              {loading ? (
                <div className="flex h-[206px] items-center justify-center rounded-xl border border-[#e3eae5] bg-[#f4f7f5]">
                  <LoadingSpinner label="Loading map..." />
                </div>
              ) : (
                <CitizenDashboardMap markers={summary?.mapReports ?? []} />
              )}
            </section>
          </div>

          {/* Row 3: Recent Complaints + Quick Actions */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Recent Complaints */}
            <section className="rounded-xl border border-[#e5ece8] bg-white p-5 shadow-[0_2px_10px_rgba(16,42,28,0.04)] lg:col-span-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#14231b]">
                  Recent Complaints
                </h2>
                <Link
                  href="/citizen/complaints"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#16793d] hover:text-[#126232]"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {loading ? (
                <LoadingSpinner label="Loading recent complaints..." />
              ) : !summary || summary.recentReports.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#64746c]">
                  No reports submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs sm:text-[13px]">
                    <thead>
                      <tr className="rounded-lg bg-[#f6f9f7] text-[#5d6d64]">
                        <th className="rounded-l-lg px-3.5 py-2.5 font-semibold">
                          Report Code
                        </th>
                        <th className="px-3.5 py-2.5 font-semibold">
                          Category
                        </th>
                        <th className="px-3.5 py-2.5 font-semibold">
                          Location
                        </th>
                        <th className="px-3.5 py-2.5 font-semibold">Status</th>
                        <th className="px-3.5 py-2.5 font-semibold">Date</th>
                        <th className="rounded-r-lg px-3.5 py-2.5 text-right font-semibold">
                          <span className="sr-only">Action</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eef3ef]">
                      {summary.recentReports.slice(0, 3).map((report) => {
                        const catVis = getCategoryVisual(report.category);
                        const CatIcon = catVis.icon;
                        const pill = getDashboardStatusPill(report.status);
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
                            <td className="max-w-[160px] truncate px-3.5 py-3 text-[#5d6d64]">
                              {report.address}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pill.className}`}
                              >
                                {pill.label}
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
            </section>

            {/* Quick Actions */}
            <section className="flex flex-col rounded-xl border border-[#e5ece8] bg-white p-5 shadow-[0_2px_10px_rgba(16,42,28,0.04)] lg:col-span-4">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#16a34a]" />
                <h2 className="text-base font-bold text-[#14231b]">
                  Quick Actions
                </h2>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-3">
                <Link
                  href="/citizen/report"
                  className="group flex flex-col justify-between rounded-xl bg-[#ebf8ef] p-4 transition-colors hover:bg-[#ddf3e4]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9eed6] text-[#15803d]">
                    <FilePlus2 className="h-5 w-5" />
                  </span>
                  <div className="mt-4">
                    <p className="text-[13px] font-bold leading-snug text-[#143322]">
                      Report Waste Problem
                    </p>
                    <div className="mt-2 flex justify-end">
                      <ArrowRight className="h-4 w-4 text-[#16793d] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>

                <Link
                  href="/citizen/complaints"
                  className="group flex flex-col justify-between rounded-xl bg-[#eaf3fe] p-4 transition-colors hover:bg-[#dcebfc]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#cbe0fc] text-[#2563eb]">
                    <ListChecks className="h-5 w-5" />
                  </span>
                  <div className="mt-4">
                    <p className="text-[13px] font-bold leading-snug text-[#14231b]">
                      View My Complaints
                    </p>
                    <div className="mt-2 flex justify-end">
                      <ArrowRight className="h-4 w-4 text-[#2563eb] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
