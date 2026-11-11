'use client';

import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6)),
      );
    },
  });
  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const [tileError, setTileError] = useState(false);
  const center: [number, number] =
    latitude !== null && longitude !== null
      ? [latitude, longitude]
      : [23.7806, 90.4071];

  return (
    <div className="space-y-2">
      <div className="relative h-64 w-full overflow-hidden rounded-sm border border-[#d1cec4] bg-[#eceae3]">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              tileerror: () => setTileError(true),
            }}
          />
          <ClickHandler onSelect={onChange} />
          {latitude !== null && longitude !== null && (
            <CircleMarker
              center={[latitude, longitude]}
              radius={9}
              pathOptions={{
                color: '#133826',
                fillColor: '#1b5e3c',
                fillOpacity: 0.85,
                weight: 2,
              }}
            />
          )}
        </MapContainer>
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

