'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusAlert } from '@/components/ui/status-alert';
import { getApiErrorMessage } from '@/lib/api';
import {
  CATEGORY_META,
  PRIORITY_META,
  STATUS_META,
} from '@/lib/formatters';
import { statisticsService } from '@/services/statistics.service';
import { StatisticsOverview } from '@/types/domain';

export default function AdminStatisticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedRange, setAppliedRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [stats, setStats] = useState<StatisticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await statisticsService.getOverview(appliedRange);
        if (active) {
          setStats(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            getApiErrorMessage(err, 'Unable to load waste collection statistics.'),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    void loadStats();
    return () => {
      active = false;
    };
  }, [appliedRange]);

  const categoryData =
    stats?.byCategory.map((item) => ({
      name: CATEGORY_META[item.category].shortLabel,
      count: item.count,
    })) || [];

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell
        title="Waste Collection Statistics"
        subtitle="MongoDB aggregation metrics across categories, resolution times, and crew workload"
      >
        <div className="max-w-6xl space-y-8">
          {/* Date Filter */}
          <div className="flex flex-wrap items-end gap-3 rounded-sm border border-[#dddad1] bg-white p-4">
            <div>
              <label
                htmlFor="stats-start"
                className="block font-mono text-[11px] uppercase text-[#5a5f59]"
              >
                From Date
              </label>
              <input
                id="stats-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 h-9 rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm focus:border-[#1b5e3c] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="stats-end"
                className="block font-mono text-[11px] uppercase text-[#5a5f59]"
              >
                To Date
              </label>
              <input
                id="stats-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 h-9 rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm focus:border-[#1b5e3c] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setAppliedRange({
                  startDate: startDate || undefined,
                  endDate: endDate || undefined,
                })
              }
              className="h-9 rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white hover:bg-[#14482e]"
            >
              Apply Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setAppliedRange({});
              }}
              className="h-9 rounded-sm border border-[#d1cec4] px-3 text-sm font-medium text-[#5a5f59] hover:bg-[#faf9f6]"
            >
              Reset
            </button>
          </div>

          {error && <StatusAlert variant="error" message={error} />}

          {/* Headline Resolution Metrics */}
          <div className="grid grid-cols-2 divide-y divide-[#dddad1] border border-[#dddad1] bg-white sm:grid-cols-5 sm:divide-x sm:divide-y-0">
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                Total Reports
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {loading ? '—' : (stats?.summary.totalReports ?? 0)}
              </p>
            </div>
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                Pending
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#6d4c0f]">
                {loading ? '—' : (stats?.summary.pendingReports ?? 0)}
              </p>
            </div>
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                Resolved
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#133826]">
                {loading ? '—' : (stats?.summary.resolvedReports ?? 0)}
              </p>
            </div>
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                Resolution Rate
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1b5e3c]">
                {loading
                  ? '—'
                  : `${stats?.resolutionStats.resolutionRate ?? 0}%`}
              </p>
            </div>
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                Avg Resolution
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {loading
                  ? '—'
                  : `${stats?.resolutionStats.averageResolutionHours ?? 0}h`}
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner label="Computing statistics..." />
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Monthly Reporting Trends
                  </h2>
                  <div className="mt-4 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.monthlyTrends || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eceae3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="total"
                          name="Total"
                          stroke="#133826"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="resolved"
                          name="Resolved"
                          stroke="#1b5e3c"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Reports by Category
                  </h2>
                  <div className="mt-4 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eceae3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#1b5e3c"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>

              {/* Status & Priority Breakdowns */}
              <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Breakdown by Status
                  </h2>
                  <dl className="mt-3 divide-y divide-[#eceae3] text-sm">
                    {stats?.byStatus.map((row) => (
                      <div
                        key={row.status}
                        className="flex items-center justify-between py-2.5"
                      >
                        <dt className="text-[#171a17]">
                          {STATUS_META[row.status].label}
                        </dt>
                        <dd className="font-mono font-semibold tabular-nums">
                          {row.count}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Breakdown by Priority
                  </h2>
                  <dl className="mt-3 divide-y divide-[#eceae3] text-sm">
                    {stats?.byPriority.map((row) => (
                      <div
                        key={row.priority}
                        className="flex items-center justify-between py-2.5"
                      >
                        <dt className="text-[#171a17]">
                          {PRIORITY_META[row.priority].label}
                        </dt>
                        <dd className="font-mono font-semibold tabular-nums">
                          {row.count}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </div>

              {/* Team Workload Table */}
              <section className="overflow-hidden rounded-sm border border-[#dddad1] bg-white">
                <div className="border-b border-[#dddad1] bg-[#faf9f6] px-4 py-3">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                    Collection Team Workload
                  </h2>
                </div>
                {!stats || stats.teamWorkload.length === 0 ? (
                  <p className="p-5 text-sm text-[#5a5f59]">
                    No collection teams found.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#eceae3] font-mono text-[11px] uppercase text-[#5a5f59]">
                          <th className="px-4 py-2.5">Team</th>
                          <th className="px-4 py-2.5">Service Area</th>
                          <th className="px-4 py-2.5">Assigned</th>
                          <th className="px-4 py-2.5">In Progress</th>
                          <th className="px-4 py-2.5">Resolved</th>
                          <th className="px-4 py-2.5">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eceae3]">
                        {stats.teamWorkload.map((row) => (
                          <tr key={row.teamId}>
                            <td className="px-4 py-3 font-medium text-[#171a17]">
                              {row.teamName}
                            </td>
                            <td className="px-4 py-3 text-[#5a5f59]">
                              {row.serviceArea}
                            </td>
                            <td className="px-4 py-3 font-mono tabular-nums">
                              {row.assignedCount}
                            </td>
                            <td className="px-4 py-3 font-mono tabular-nums">
                              {row.inProgressCount}
                            </td>
                            <td className="px-4 py-3 font-mono tabular-nums text-[#133826]">
                              {row.resolvedCount}
                            </td>
                            <td className="px-4 py-3 font-mono font-semibold tabular-nums">
                              {row.totalAssigned}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
