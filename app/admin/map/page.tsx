'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
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
import { mapsService } from '@/services/maps.service';
import {
  MapReportMarker,
  ReportPriority,
  ReportStatus,
  WasteCategory,
} from '@/types/domain';

const AdminWasteMap = dynamic(
  () => import('@/components/maps/admin-waste-map'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-sm border border-[#dddad1] bg-[#eceae3] font-mono text-xs uppercase text-[#5a5f59]">
        Loading interactive waste map...
      </div>
    ),
  },
);

export default function AdminMapMonitoringPage() {
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [category, setCategory] = useState<WasteCategory | ''>('');
  const [priority, setPriority] = useState<ReportPriority | ''>('');

  const [markers, setMarkers] = useState<MapReportMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadMarkers = async () => {
      setLoading(true);
      try {
        const data = await mapsService.getReportMarkers({
          status,
          category,
          priority,
        });
        if (active) {
          setMarkers(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, 'Unable to load map markers.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    void loadMarkers();
    return () => {
      active = false;
    };
  }, [status, category, priority]);

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell
        title="Map Monitoring"
        subtitle="Geolocated waste reports plotted from saved coordinates (address-only reports excluded)"
      >
        <div className="max-w-6xl space-y-5">
          {/* Filters + Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-[#dddad1] bg-white p-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus | '')}
                aria-label="Filter map by status"
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
                onChange={(e) =>
                  setCategory(e.target.value as WasteCategory | '')
                }
                aria-label="Filter map by category"
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
                onChange={(e) =>
                  setPriority(e.target.value as ReportPriority | '')
                }
                aria-label="Filter map by priority"
                className="h-9 rounded-sm border border-[#d1cec4] bg-white px-2.5 text-sm focus:border-[#1b5e3c] focus:outline-none"
              >
                <option value="">All Priorities</option>
                {(Object.keys(PRIORITY_META) as ReportPriority[]).map((k) => (
                  <option key={k} value={k}>
                    {PRIORITY_META[k].label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setStatus('');
                  setCategory('');
                  setPriority('');
                }}
                className="h-9 rounded-sm border border-[#d1cec4] px-3 text-xs font-medium text-[#5a5f59] hover:bg-[#faf9f6]"
              >
                Reset
              </button>
            </div>

            {/* Priority Legend */}
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#171a17]">
              {(Object.keys(PRIORITY_META) as ReportPriority[]).map((p) => (
                <span key={p} className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-[#171a17]"
                    style={{ backgroundColor: PRIORITY_META[p].markerColor }}
                  />
                  <span>{PRIORITY_META[p].label}</span>
                </span>
              ))}
            </div>
          </div>

          {error && <StatusAlert variant="error" message={error} />}

          {loading ? (
            <LoadingSpinner label="Loading geolocated waste reports..." />
          ) : markers.length === 0 ? (
            <div className="rounded-sm border border-[#dddad1] bg-white p-10 text-center">
              <p className="text-sm font-medium text-[#171a17]">
                No geolocated waste reports match these filters
              </p>
              <p className="mt-1 text-xs text-[#5a5f59]">
                Reports submitted without latitude and longitude coordinates are
                not plotted as synthetic markers.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-mono text-xs text-[#5a5f59]">
                Showing {markers.length} geolocated{' '}
                {markers.length === 1 ? 'report' : 'reports'}
              </p>
              <AdminWasteMap markers={markers} />
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

