'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  CATEGORY_META,
  PRIORITY_META,
  STATUS_META,
} from '@/lib/formatters';
import { MapReportMarker } from '@/types/domain';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function AdminWasteMap({
  markers,
}: {
  markers: MapReportMarker[];
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const center: [number, number] =
      markers.length > 0
        ? [markers[0].latitude, markers[0].longitude]
        : [23.7806, 90.4071];

    const map = L.map(el, {
      center,
      zoom: 12,
      scrollWheelZoom: true,
    });

    const tileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
      },
    );
    tileLayer.on('tileerror', () => setTileError(true));
    tileLayer.addTo(map);

    for (const marker of markers) {
      const color = PRIORITY_META[marker.priority].markerColor;
      const circle = L.circleMarker([marker.latitude, marker.longitude], {
        radius: 9,
        color: '#171a17',
        fillColor: color,
        fillOpacity: 0.9,
        weight: 1.5,
      }).addTo(map);

      const popupEl = document.createElement('div');
      popupEl.className = 'min-w-[200px] space-y-1.5 text-xs text-[#171a17]';
      popupEl.innerHTML = `
        <p class="font-mono font-semibold">${escapeHtml(marker.reportCode)}</p>
        <p class="font-medium">${escapeHtml(CATEGORY_META[marker.category].shortLabel)}</p>
        <p><span class="text-[#5a5f59]">Priority:</span> <strong>${escapeHtml(PRIORITY_META[marker.priority].label)}</strong></p>
        <p><span class="text-[#5a5f59]">Status:</span> ${escapeHtml(STATUS_META[marker.status].label)}</p>
        <p class="text-[#5a5f59]">${escapeHtml(marker.address)}</p>
      `;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'View Details';
      btn.className = 'pt-1 font-medium text-[#1b5e3c] underline cursor-pointer';
      btn.onclick = () => router.push(`/admin/reports/${marker.id}`);
      popupEl.appendChild(btn);

      circle.bindPopup(popupEl);
    }

    return () => {
      map.remove();
    };
  }, [markers, router]);

  return (
    <div className="space-y-2">
      <div className="relative h-[500px] w-full overflow-hidden rounded-sm border border-[#dddad1] bg-[#eceae3]">
        <div ref={containerRef} className="h-full w-full" />
      </div>
      {tileError && (
        <p className="text-xs text-[#9a3412]">
          OpenStreetMap tiles could not be loaded. Markers remain plotted on
          their saved coordinates.
        </p>
      )}
    </div>
  );
}
