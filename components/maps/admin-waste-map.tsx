'use client';

import { useState } from 'react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from 'react-leaflet';
import {
  CATEGORY_META,
  PRIORITY_META,
  STATUS_META,
} from '@/lib/formatters';
import { MapReportMarker } from '@/types/domain';

export default function AdminWasteMap({
  markers,
}: {
  markers: MapReportMarker[];
}) {
  const [tileError, setTileError] = useState(false);

  const center: [number, number] =
    markers.length > 0
      ? [markers[0].latitude, markers[0].longitude]
      : [23.7806, 90.4071];

  return (
    <div className="space-y-2">
      <div className="relative h-[500px] w-full overflow-hidden rounded-sm border border-[#dddad1] bg-[#eceae3]">
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              tileerror: () => setTileError(true),
            }}
          />
          {markers.map((marker) => {
            const color = PRIORITY_META[marker.priority].markerColor;
            return (
              <CircleMarker
                key={marker.id}
                center={[marker.latitude, marker.longitude]}
                radius={9}
                pathOptions={{
                  color: '#171a17',
                  fillColor: color,
                  fillOpacity: 0.9,
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div className="min-w-[200px] space-y-1.5 text-xs text-[#171a17]">
                    <p className="font-mono font-semibold">
                      {marker.reportCode}
                    </p>
                    <p className="font-medium">
                      {CATEGORY_META[marker.category].shortLabel}
                    </p>
                    <p>
                      <span className="text-[#5a5f59]">Priority:</span>{' '}
                      <strong>{PRIORITY_META[marker.priority].label}</strong>
                    </p>
                    <p>
                      <span className="text-[#5a5f59]">Status:</span>{' '}
                      {STATUS_META[marker.status].label}
                    </p>
                    <p className="text-[#5a5f59]">{marker.address}</p>
                    <div className="pt-1">
                      <Link
                        href={`/admin/reports/${marker.id}`}
                        className="font-medium text-[#1b5e3c] underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
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

