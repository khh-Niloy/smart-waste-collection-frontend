'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Minus, Plus } from 'lucide-react';

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  heightClassName?: string;
}

function createGreenPin(): L.DivIcon {
  return L.divIcon({
    className: 'cleancity-picker-pin',
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.26801 0 0 6.26801 0 14C0 23.625 14 36 14 36C14 36 28 23.625 28 14C28 6.26801 21.732 0 14 0Z" fill="#22A84B" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="14" cy="13.5" r="4.5" fill="#FFFFFF"/>
    </svg>`,
  });
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  heightClassName = 'h-48',
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const initialCenter: [number, number] =
      latitude !== null && longitude !== null
        ? [latitude, longitude]
        : [23.7511, 90.3775];

    const map = L.map(el, {
      center: initialCenter,
      zoom: 13,
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

    map.on('click', (e: L.LeafletMouseEvent) => {
      onChangeRef.current(
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6)),
      );
    });

    return () => {
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (latitude !== null && longitude !== null) {
      markerRef.current = L.marker([latitude, longitude], {
        icon: createGreenPin(),
      }).addTo(map);
      map.panTo([latitude, longitude]);
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-1.5">
      <div
        className={`relative w-full overflow-hidden rounded-xl border border-[#dce4df] bg-[#eef2ef] ${heightClassName}`}
      >
        <div ref={containerRef} className="h-full w-full" />
        <div className="pointer-events-auto absolute top-2.5 left-2.5 z-[400] flex flex-col overflow-hidden rounded-lg border border-[#dce4df] bg-white shadow-sm">
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
            className="flex h-7 w-7 items-center justify-center text-[#35463c] hover:bg-[#f4f7f5]"
            aria-label="Zoom out"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {tileError && (
        <p className="text-xs text-[#9a3412]">
          Map tiles failed to load. You can still enter your address manually.
        </p>
      )}
    </div>
  );
}
