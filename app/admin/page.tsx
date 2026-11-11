'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { useAuth } from '@/contexts/auth-context';
import { getApiErrorMessage } from '@/lib/api';
import {
  CATEGORY_META,
  PRIORITY_META,
  STATUS_META,
} from '@/lib/formatters';
import { statisticsService } from '@/services/statistics.service';
import { StatisticsOverview } from '@/types/domain';

export default function AdminDashboardPage() {
  const { user } = useAuth();
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
    if (user?.role !== 'ADMIN') return;
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
            getApiErrorMessage(err, 'Failed to load dashboard statistics.'),
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
  }, [user, appliedRange]);

  const categoryData =
    stats?.byCategory.map((item) => ({
      name: CATEGORY_META[item.category].shortLabel,
      count: item.count,
    })) || [];

  const statusData =
    stats?.byStatus.map((item) => ({
      name: STATUS_META[item.status].label,
      count: item.count,
    })) || [];

  const priorityData =
    stats?.byPriority.map((item) => ({
      name: PRIORITY_META[item.priority].label,
      count: item.count,
    })) || [];

  const summary = stats?.summary;

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell
        title="Municipal Operations Dashboard"
        subtitle="Real-time waste report volume, priority triage, and crew capacity"
        action={
          <Link
            href="/admin/reports"
            className="inline-flex h-9 items-center rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white transition-colors hover:bg-[#14482e]"
          >
            Manage Reports
          </Link>
        }
      >
        <div className="max-w-6xl space-y-8">
          {/* Date Range Filter */}
          <div className="flex flex-wrap items-end gap-3 rounded-sm border border-[#dddad1] bg-white p-4">
            <div>
              <label
                htmlFor="dash-start"
                className="block font-mono text-[11px] uppercase text-[#5a5f59]"
              >
                From Date
              </label>
              <input
                id="dash-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 h-9 rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm focus:border-[#1b5e3c] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="dash-end"
                className="block font-mono text-[11px] uppercase text-[#5a5f59]"
              >
                To Date
              </label>
              <input
                id="dash-end"
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
              className="h-9 rounded-sm border border-[#d1cec4] bg-white px-3 text-sm font-medium text-[#5a5f59] hover:bg-[#faf9f6]"
            >
              Reset
            </button>
          </div>

          {error && <StatusAlert variant="error" message={error} />}

          {/* 8 Summary Metrics in Two Crisp Ruled Strips */}
          <div className="grid grid-cols-2 divide-y divide-[#dddad1] border border-[#dddad1] bg-white sm:grid-cols-4 sm:divide-x">
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Total Reports
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#171a17]">
                {loading ? '—' : (summary?.totalReports ?? 0)}
              </p>
            </div>
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Submitted
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#171a17]">
                {loading ? '—' : (summary?.submittedReports ?? 0)}
              </p>
            </div>
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Acknowledged
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1e3a5f]">
                {loading ? '—' : (summary?.acknowledgedReports ?? 0)}
              </p>
            </div>
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Assigned
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#6d4c0f]">
                {loading ? '—' : (summary?.assignedReports ?? 0)}
              </p>
            </div>
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                In-Progress
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1b5e3c]">
                {loading ? '—' : (summary?.inProgressReports ?? 0)}
              </p>
            </div>
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Resolved
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#133826]">
                {loading ? '—' : (summary?.resolvedReports ?? 0)}
              </p>
            </div>
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Urgent / High
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#991b1b]">
                {loading ? '—' : (summary?.urgentHighReports ?? 0)}
              </p>
            </div>
            <div className="p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                Active Teams
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#133826]">
                {loading ? '—' : (summary?.activeTeamsCount ?? 0)}
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner label="Aggregating operational charts..." />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* 1. Reports by Category */}
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
                      <Bar dataKey="count" fill="#1b5e3c" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* 2. Monthly Complaint Trends */}
              <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                  Monthly Complaint Trends
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
                        name="Submitted"
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

              {/* 3. Reports by Status */}
              <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                  Reports by Status
                </h2>
                <div className="mt-4 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eceae3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#133826" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* 4. Reports by Priority */}
              <section className="rounded-sm border border-[#dddad1] bg-white p-5">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                  Reports by Priority
                </h2>
                <div className="mt-4 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eceae3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6d4c0f" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
