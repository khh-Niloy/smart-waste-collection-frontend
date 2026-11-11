'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
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
        : [23.7806, 90.4071];

    const map = L.map(el, {
      center: initialCenter,
      zoom: 13,
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
      markerRef.current = L.circleMarker([latitude, longitude], {
        radius: 9,
        color: '#133826',
        fillColor: '#1b5e3c',
        fillOpacity: 0.85,
        weight: 2,
      }).addTo(map);
      map.panTo([latitude, longitude]);
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-2">
      <div className="relative h-64 w-full overflow-hidden rounded-sm border border-[#d1cec4] bg-[#eceae3]">
        <div ref={containerRef} className="h-full w-full" />
      </div>
      {tileError && (
        <p className="text-xs text-[#9a3412]">
          Map tiles failed to load from OpenStreetMap. You can still enter
          latitude/longitude manually or submit using your street address.
        </p>
      )}
    </div>
  );
}
