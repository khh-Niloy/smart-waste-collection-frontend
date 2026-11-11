'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  FileWarning,
  HelpCircle,
  ImagePlus,
  MapPin,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';
import { PriorityBadge } from '@/components/reports/status-badge';
import { StatusAlert } from '@/components/ui/status-alert';
import { getApiErrorMessage } from '@/lib/api';
import { CATEGORY_META } from '@/lib/formatters';
import { reportsService } from '@/services/reports.service';
import { uploadsService } from '@/services/uploads.service';
import { WasteCategory, WasteReport } from '@/types/domain';

const LocationPicker = dynamic(
  () => import('@/components/maps/location-picker'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-sm border border-[#d1cec4] bg-[#eceae3] font-mono text-xs uppercase text-[#5a5f59]">
        Loading map...
      </div>
    ),
  },
);

const CATEGORY_ICONS: Record<
  WasteCategory,
  React.ComponentType<{ className?: string }>
> = {
  OVERFLOWING_GARBAGE_BIN: Trash2,
  ILLEGAL_WASTE_DUMPING: AlertTriangle,
  MISSED_WASTE_COLLECTION: Truck,
  HAZARDOUS_WASTE: FileWarning,
  OTHER: HelpCircle,
};

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ReportWastePage() {
  const [category, setCategory] = useState<WasteCategory>(
    'OVERFLOWING_GARBAGE_BIN',
  );
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [ward, setWard] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(true);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<WasteReport | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type.toLowerCase())) {
      setError('Unsupported image format. Please choose JPEG, JPG, PNG, or WEBP.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Selected photograph exceeds the 5 MB maximum file size.');
      e.target.value = '';
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleUseGeolocation = () => {
    setGeoMessage(null);
    if (!navigator.geolocation) {
      setGeoMessage(
        'Browser geolocation is not supported. Enter your address manually or click on the map.',
      );
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(Number(position.coords.latitude.toFixed(6)));
        setLongitude(Number(position.coords.longitude.toFixed(6)));
        setGeoLoading(false);
        setGeoMessage('Current GPS coordinates captured.');
      },
      () => {
        setGeoLoading(false);
        setGeoMessage(
          'Location permission denied or unavailable. You can still pin on the map or enter the street address manually.',
        );
      },
      { timeout: 8000 },
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 15) {
      setError('Description must be at least 15 characters long.');
      return;
    }
    if (trimmedDescription.length > 2000) {
      setError('Description must not exceed 2000 characters.');
      return;
    }

    if (!street.trim() || !area.trim() || !city.trim()) {
      setError('Street/road, area/neighborhood, and city are required.');
      return;
    }

    const formattedAddress = [
      street.trim(),
      area.trim(),
      city.trim(),
      ward.trim(),
    ]
      .filter(Boolean)
      .join(', ');

    setSubmitting(true);
    try {
      let uploadedStorageKey: string | undefined;
      if (photoFile) {
        const uploaded = await uploadsService.uploadPhoto(photoFile);
        uploadedStorageKey = uploaded.storageKey;
      }

      const created = await reportsService.create({
        category,
        description: trimmedDescription,
        address: formattedAddress,
        street: street.trim(),
        area: area.trim(),
        city: city.trim(),
        ...(ward.trim() ? { ward: ward.trim() } : {}),
        ...(latitude !== null && longitude !== null
          ? { latitude, longitude }
          : {}),
        ...(uploadedStorageKey ? { photoUrl: uploadedStorageKey } : {}),
      });

      setSubmittedReport(created);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to submit waste report.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['CITIZEN']}>
      <AppShell
        title="Report Waste Problem"
        subtitle="Submit a municipal sanitation complaint with location and optional photographic evidence"
      >
        {submittedReport ? (
          <div className="max-w-2xl rounded-sm border border-[#cfe0d5] bg-white p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1b5e3c]" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#1b5e3c]">
                  Submission Confirmed
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#171a17]">
                  Tracking Code:{' '}
                  <span className="font-mono">{submittedReport.reportCode}</span>
                </h2>
                <p className="mt-1 text-sm text-[#5a5f59]">
                  Your report has been logged in MongoDB and routed to municipal
                  dispatchers.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-y border-[#eceae3] py-4 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                  Suggested Priority
                </p>
                <div className="mt-1">
                  <PriorityBadge priority={submittedReport.priority} />
                </div>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                  Classification Reason
                </p>
                <p className="mt-1 text-xs text-[#5a5f59]">
                  {submittedReport.priorityReason}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/citizen/complaints/${submittedReport._id}`}
                className="inline-flex h-9 items-center rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white hover:bg-[#14482e]"
              >
                View Report Details
              </Link>
              <Link
                href="/citizen/complaints"
                className="inline-flex h-9 items-center rounded-sm border border-[#d1cec4] bg-white px-4 text-sm font-medium text-[#171a17] hover:bg-[#faf9f6]"
              >
                My Complaints
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmittedReport(null);
                  setDescription('');
                  setStreet('');
                  setArea('');
                  setWard('');
                  setLatitude(null);
                  setLongitude(null);
                  handleRemovePhoto();
                }}
                className="inline-flex h-9 items-center rounded-sm border border-[#d1cec4] bg-white px-4 text-sm font-medium text-[#171a17] hover:bg-[#faf9f6]"
              >
                Submit Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-4xl space-y-8" noValidate>
            {error && <StatusAlert variant="error" message={error} />}

            {/* 01 Category */}
            <section className="space-y-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                  01 / Waste Category
                </p>
                <h2 className="mt-0.5 text-sm font-semibold text-[#171a17]">
                  Select the issue type
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(Object.keys(CATEGORY_META) as WasteCategory[]).map((key) => {
                  const meta = CATEGORY_META[key];
                  const Icon = CATEGORY_ICONS[key];
                  const selected = category === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key)}
                      className={`flex items-start gap-3 rounded-sm border p-3.5 text-left transition-colors ${
                        selected
                          ? 'border-[#133826] bg-[#eef5f0] text-[#133826]'
                          : 'border-[#dddad1] bg-white text-[#171a17] hover:bg-[#faf9f6]'
                      }`}
                    >
                      <Icon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          selected ? 'text-[#133826]' : 'text-[#5a5f59]'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{meta.label}</p>
                        <p className="mt-0.5 text-xs leading-snug text-[#5a5f59]">
                          {meta.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 02 Description */}
            <section className="space-y-2 border-t border-[#dddad1] pt-6">
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="description"
                  className="text-sm font-semibold text-[#171a17]"
                >
                  02 / Problem Description
                </label>
                <span className="font-mono text-xs text-[#5a5f59]">
                  {description.trim().length} / 2000
                </span>
              </div>
              <textarea
                id="description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the waste issue, volume, nearby landmarks (e.g. schools, clinics), or safety concerns (min. 15 characters)..."
                className="w-full rounded-sm border border-[#d1cec4] bg-white p-3 text-sm text-[#171a17] placeholder:text-[#8c908a] focus:border-[#1b5e3c] focus:outline-none"
              />
            </section>

            {/* 03 Address & Coordinates */}
            <section className="space-y-4 border-t border-[#dddad1] pt-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                  03 / Address &amp; Location
                </p>
                <h2 className="mt-0.5 text-sm font-semibold text-[#171a17]">
                  Where is the problem located?
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="street"
                    className="block text-xs font-medium uppercase tracking-[0.04em] text-[#5a5f59]"
                  >
                    Street / Road *
                  </label>
                  <input
                    id="street"
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Road 12, House 4"
                    className="mt-1.5 h-10 w-full rounded-sm border border-[#d1cec4] bg-white px-3 text-sm focus:border-[#1b5e3c] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="area"
                    className="block text-xs font-medium uppercase tracking-[0.04em] text-[#5a5f59]"
                  >
                    Area / Neighborhood *
                  </label>
                  <input
                    id="area"
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Dhanmondi"
                    className="mt-1.5 h-10 w-full rounded-sm border border-[#d1cec4] bg-white px-3 text-sm focus:border-[#1b5e3c] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-xs font-medium uppercase tracking-[0.04em] text-[#5a5f59]"
                  >
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dhaka"
                    className="mt-1.5 h-10 w-full rounded-sm border border-[#d1cec4] bg-white px-3 text-sm focus:border-[#1b5e3c] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ward"
                    className="block text-xs font-medium uppercase tracking-[0.04em] text-[#5a5f59]"
                  >
                    Ward / Zone (optional)
                  </label>
                  <input
                    id="ward"
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="Ward 15"
                    className="mt-1.5 h-10 w-full rounded-sm border border-[#d1cec4] bg-white px-3 text-sm focus:border-[#1b5e3c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-sm border border-[#dddad1] bg-white p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#1b5e3c]" />
                    <span className="text-sm font-medium text-[#171a17]">
                      Map Coordinates (optional)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUseGeolocation}
                      disabled={geoLoading}
                      className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-xs font-medium text-[#171a17] hover:bg-[#eceae3] disabled:opacity-60"
                    >
                      <Compass className="h-3.5 w-3.5 text-[#1b5e3c]" />
                      <span>
                        {geoLoading ? 'Locating...' : 'Use Current Location'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMap((prev) => !prev)}
                      className="inline-flex h-8 items-center rounded-sm border border-[#d1cec4] bg-white px-3 text-xs font-medium text-[#171a17] hover:bg-[#faf9f6]"
                    >
                      {showMap ? 'Hide Map' : 'Show Map'}
                    </button>
                    {latitude !== null && longitude !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setLatitude(null);
                          setLongitude(null);
                        }}
                        className="inline-flex h-8 items-center rounded-sm border border-[#e7c5c5] px-2.5 text-xs text-[#7f1d1d] hover:bg-[#fdf6f5]"
                      >
                        Clear Pin
                      </button>
                    )}
                  </div>
                </div>

                {geoMessage && (
                  <p className="text-xs text-[#5a5f59]">{geoMessage}</p>
                )}

                {showMap && (
                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onChange={(lat, lng) => {
                      setLatitude(lat);
                      setLongitude(lng);
                    }}
                  />
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="latitude"
                      className="block font-mono text-[11px] uppercase text-[#5a5f59]"
                    >
                      Latitude
                    </label>
                    <input
                      id="latitude"
                      type="number"
                      step="any"
                      value={latitude ?? ''}
                      onChange={(e) =>
                        setLatitude(
                          e.target.value === '' ? null : Number(e.target.value),
                        )
                      }
                      placeholder="Click map or enter (e.g. 23.7465)"
                      className="mt-1 h-9 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 font-mono text-xs focus:border-[#1b5e3c] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="longitude"
                      className="block font-mono text-[11px] uppercase text-[#5a5f59]"
                    >
                      Longitude
                    </label>
                    <input
                      id="longitude"
                      type="number"
                      step="any"
                      value={longitude ?? ''}
                      onChange={(e) =>
                        setLongitude(
                          e.target.value === '' ? null : Number(e.target.value),
                        )
                      }
                      placeholder="Click map or enter (e.g. 90.3760)"
                      className="mt-1 h-9 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 font-mono text-xs focus:border-[#1b5e3c] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 04 Photograph Upload */}
            <section className="space-y-3 border-t border-[#dddad1] pt-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                  04 / Waste-Site Photograph (Optional)
                </p>
                <p className="mt-0.5 text-xs text-[#5a5f59]">
                  JPEG, JPG, PNG, or WEBP up to 5 MB. Stored securely in
                  Supabase Storage.
                </p>
              </div>

              {photoPreview ? (
                <div className="flex flex-col gap-4 rounded-sm border border-[#dddad1] bg-white p-4 sm:flex-row sm:items-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Waste site preview"
                    className="h-40 w-full rounded-sm border border-[#eceae3] object-cover sm:w-56"
                  />
                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#171a17]">
                        {photoFile?.name}
                      </p>
                      <p className="font-mono text-xs text-[#5a5f59]">
                        {photoFile
                          ? `${(photoFile.size / 1024).toFixed(1)} KB`
                          : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-sm border border-[#d1cec4] bg-white px-3 text-xs font-medium text-[#171a17] hover:bg-[#faf9f6]">
                        <ImagePlus className="h-3.5 w-3.5" />
                        <span>Replace Photo</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handlePhotoSelect}
                          className="sr-only"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-[#e7c5c5] bg-white px-3 text-xs font-medium text-[#7f1d1d] hover:bg-[#fdf6f5]"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-[#c7c4b8] bg-white px-6 py-8 text-center transition-colors hover:border-[#1b5e3c] hover:bg-[#faf9f6]">
                  <ImagePlus className="h-6 w-6 text-[#5a5f59]" />
                  <span className="mt-2 text-sm font-medium text-[#171a17]">
                    Choose a waste-site photograph
                  </span>
                  <span className="mt-0.5 text-xs text-[#5a5f59]">
                    JPEG, PNG, or WEBP (Max 5 MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    className="sr-only"
                  />
                </label>
              )}
            </section>

            <div className="flex items-center gap-3 border-t border-[#dddad1] pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 items-center rounded-sm bg-[#1b5e3c] px-6 text-sm font-medium text-white transition-colors hover:bg-[#14482e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting Report...' : 'Submit Waste Report'}
              </button>
              <Link
                href="/citizen"
                className="inline-flex h-10 items-center rounded-sm border border-[#d1cec4] bg-white px-4 text-sm font-medium text-[#171a17] hover:bg-[#faf9f6]"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
