'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import { CATEGORY_META, STATUS_META } from '@/lib/formatters';
import { MapReportMarker, ReportPriority } from '@/types/domain';

function createPriorityPinIcon(priority: ReportPriority): L.DivIcon {
  const colorMap: Record<ReportPriority, string> = {
    URGENT: '#E02424',
    HIGH: '#F59E0B',
    NORMAL: '#FACC15',
    LOW: '#16A34A',
  };
  const fill = colorMap[priority];

  return L.divIcon({
    className: 'cleancity-map-pin',
    iconSize: [24, 32],
    iconAnchor: [12, 30],
    popupAnchor: [0, -28],
    html: `<svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37258 0 0 5.37258 0 12C0 20.25 12 32 12 32C12 32 24 20.25 24 12C24 5.37258 18.6274 0 12 0Z" fill="${fill}" stroke="#FFFFFF" stroke-width="1.5"/>
      <circle cx="12" cy="11.5" r="4" fill="#FFFFFF"/>
    </svg>`,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function CitizenDashboardMap({
  markers,
}: {
  markers: MapReportMarker[];
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [tileError, setTileError] = useState(false);

  const defaultCenter: [number, number] =
    markers.length > 0
      ? [markers[0].latitude, markers[0].longitude]
      : [23.775, 90.395];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: defaultCenter,
      zoom: 11,
      zoomControl: false,
      scrollWheelZoom: false,
    });
    mapRef.current = map;

    const tileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
      },
    );
    tileLayer.on('tileerror', () => setTileError(true));
    tileLayer.addTo(map);

    for (const marker of markers) {
      const m = L.marker([marker.latitude, marker.longitude], {
        icon: createPriorityPinIcon(marker.priority),
      }).addTo(map);

      const popupEl = document.createElement('div');
      popupEl.className = 'min-w-[180px] space-y-1 text-xs text-[#14231b]';
      popupEl.innerHTML = `
        <p class="font-mono font-semibold">${escapeHtml(marker.reportCode)}</p>
        <p class="font-medium">${escapeHtml(CATEGORY_META[marker.category].shortLabel)}</p>
        <p class="text-[#5d6d64]">${escapeHtml(marker.address)}</p>
        <p>Status: <strong>${escapeHtml(STATUS_META[marker.status].label)}</strong></p>
      `;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'View Details';
      btn.className =
        'mt-1 inline-block font-semibold text-[#16793d] underline cursor-pointer';
      btn.onclick = () => router.push(`/citizen/complaints/${marker.id}`);
      popupEl.appendChild(btn);

      m.bindPopup(popupEl);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, router]);

  return (
    <div className="relative h-[206px] w-full overflow-hidden rounded-xl border border-[#e3eae5] bg-[#eef2ef]">
      <div ref={containerRef} className="h-full w-full" />

      {/* Zoom + Center Controls */}
      <div className="pointer-events-auto absolute top-3 left-3 z-[400] flex flex-col overflow-hidden rounded-lg border border-[#dce4df] bg-white shadow-sm">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          className="flex h-7 w-7 items-center justify-center border-b border-[#e8eeea] text-[#35463c] hover:bg-[#f4f7f5]"
          aria-label="Zoom in"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          className="flex h-7 w-7 items-center justify-center border-b border-[#e8eeea] text-[#35463c] hover:bg-[#f4f7f5]"
          aria-label="Zoom out"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.setView(defaultCenter, 11)}
          className="flex h-7 w-7 items-center justify-center text-[#35463c] hover:bg-[#f4f7f5]"
          aria-label="Reset map view"
        >
          <LocateFixed className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Floating Priority Legend */}
      <div className="pointer-events-auto absolute top-3 right-3 z-[400] rounded-lg border border-[#e3eae5] bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-xs">
        <p className="mb-1.5 text-[11px] font-semibold text-[#14231b]">
          Report Priority
        </p>
        <ul className="space-y-1 text-[11px] text-[#495b51]">
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E02424]" />
            <span>Urgent</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
            <span>High</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FACC15]" />
            <span>Normal</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
            <span>Low</span>
          </li>
        </ul>
      </div>

      {tileError && (
        <div className="absolute right-3 bottom-2 left-3 z-[400] rounded bg-white/90 px-2 py-1 text-[10px] text-[#9a3412]">
          Map tiles offline — pin locations remain plotted.
        </div>
      )}
    </div>
  );
}
