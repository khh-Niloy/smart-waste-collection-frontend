'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Biohazard,
  Check,
  CheckCircle2,
  Compass,
  FilePlus2,
  ImagePlus,
  LayoutGrid,
  MapPin,
  Pencil,
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
      <div className="flex h-48 items-center justify-center rounded-xl border border-[#dce4df] bg-[#eef2ef] text-xs font-medium text-[#5d6d64]">
        Loading map...
      </div>
    ),
  },
);

const CATEGORY_CARDS: Array<{
  key: WasteCategory;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}> = [
  {
    key: 'OVERFLOWING_GARBAGE_BIN',
    title: 'Overflowing Garbage Bin',
    icon: Trash2,
    iconBg: 'bg-[#dcfce7]',
    iconColor: 'text-[#16a34a]',
  },
  {
    key: 'ILLEGAL_WASTE_DUMPING',
    title: 'Illegal Waste Dumping',
    icon: AlertTriangle,
    iconBg: 'bg-[#fef3c7]',
    iconColor: 'text-[#d97706]',
  },
  {
    key: 'MISSED_WASTE_COLLECTION',
    title: 'Missed Collection',
    icon: Truck,
    iconBg: 'bg-[#e0f2fe]',
    iconColor: 'text-[#0284c7]',
  },
  {
    key: 'HAZARDOUS_WASTE',
    title: 'Hazardous Waste',
    icon: Biohazard,
    iconBg: 'bg-[#fee2e2]',
    iconColor: 'text-[#dc2626]',
  },
  {
    key: 'OTHER',
    title: 'Other Issue',
    icon: LayoutGrid,
    iconBg: 'bg-[#ede9fe]',
    iconColor: 'text-[#7c3aed]',
  },
];

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ReportWastePage() {
  const [step, setStep] = useState<1 | 3>(1);

  const [category, setCategory] = useState<WasteCategory>(
    'OVERFLOWING_GARBAGE_BIN',
  );
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [showDetailedAddress, setShowDetailedAddress] = useState(false);
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [ward, setWard] = useState('');

  const [latitude, setLatitude] = useState<number | null>(23.7511);
  const [longitude, setLongitude] = useState<number | null>(90.3775);
  const [pinTouched, setPinTouched] = useState(false);

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

  const resolvedAddress = showDetailedAddress
    ? [street.trim(), area.trim(), city.trim(), ward.trim()]
        .filter(Boolean)
        .join(', ')
    : address.trim();

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
        'Browser geolocation is unavailable. Pin on the map or type your address below.',
      );
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(Number(position.coords.latitude.toFixed(6)));
        setLongitude(Number(position.coords.longitude.toFixed(6)));
        setPinTouched(true);
        setGeoLoading(false);
        setGeoMessage('GPS coordinates captured.');
      },
      () => {
        setGeoLoading(false);
        setGeoMessage(
          'Location permission denied. Click on the map or enter your address manually.',
        );
      },
      { timeout: 8000 },
    );
  };

  const handleProceedReview = () => {
    setError(null);
    if (description.trim().length < 15) {
      setError('Please describe the problem (minimum 15 characters).');
      return;
    }
    if (description.trim().length > 2000) {
      setError('Description must not exceed 2000 characters.');
      return;
    }
    if (resolvedAddress.length < 5) {
      setError('Please enter a valid street address or location.');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (description.trim().length < 15 || resolvedAddress.length < 5) {
      setError('Please complete all required report fields.');
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      let uploadedStorageKey: string | undefined;
      if (photoFile) {
        const uploaded = await uploadsService.uploadPhoto(photoFile);
        uploadedStorageKey = uploaded.storageKey;
      }

      const created = await reportsService.create({
        category,
        description: description.trim(),
        address: resolvedAddress,
        ...(street.trim() ? { street: street.trim() } : {}),
        ...(area.trim() ? { area: area.trim() } : {}),
        ...(city.trim() ? { city: city.trim() } : {}),
        ...(ward.trim() ? { ward: ward.trim() } : {}),
        ...(pinTouched && latitude !== null && longitude !== null
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

  const locationReady = pinTouched || Boolean(photoFile);

  return (
    <ProtectedRoute allowedRoles={['CITIZEN']}>
      <AppShell>
        <div className="mx-auto max-w-6xl space-y-5">
          {/* Page Header */}
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#daf3e2] text-[#16793d]">
              <FilePlus2 className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-[#143322]">
                Report Waste Problem
              </h1>
              <p className="text-sm text-[#5d6d64]">
                Report a sanitation issue in your area and help keep our city
                clean.
              </p>
            </div>
          </div>

          {submittedReport ? (
            <div className="mx-auto max-w-2xl rounded-xl border border-[#cfe5d6] bg-white p-6 shadow-[0_2px_10px_rgba(16,42,28,0.04)]">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#16a34a]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#16793d]">
                    Submission Confirmed
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-[#14231b]">
                    Tracking Code:{' '}
                    <span className="font-mono">
                      {submittedReport.reportCode}
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-[#5d6d64]">
                    Your complaint has been recorded and routed to municipal
                    sanitation dispatchers.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 border-y border-[#e5ece8] py-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-[#5d6d64]">
                    Suggested Priority
                  </p>
                  <div className="mt-1.5">
                    <PriorityBadge priority={submittedReport.priority} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#5d6d64]">
                    Classification Explanation
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#495b51]">
                    {submittedReport.priorityReason}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/citizen/complaints/${submittedReport._id}`}
                  className="inline-flex h-9 items-center rounded-lg bg-[#16793d] px-4 text-sm font-semibold text-white hover:bg-[#126232]"
                >
                  View Report Details
                </Link>
                <Link
                  href="/citizen/complaints"
                  className="inline-flex h-9 items-center rounded-lg border border-[#dce4df] bg-white px-4 text-sm font-medium text-[#14231b] hover:bg-[#f4f7f5]"
                >
                  My Complaints
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedReport(null);
                    setStep(1);
                    setDescription('');
                    setAddress('');
                    setStreet('');
                    setArea('');
                    setWard('');
                    setPinTouched(false);
                    handleRemovePhoto();
                  }}
                  className="inline-flex h-9 items-center rounded-lg border border-[#dce4df] bg-white px-4 text-sm font-medium text-[#14231b] hover:bg-[#f4f7f5]"
                >
                  Report Another
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 3-Step Progress Header */}
              <div className="flex flex-wrap items-center justify-center gap-3 py-1 text-xs sm:gap-5 sm:text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      step === 1
                        ? 'bg-[#1b8a44] text-white'
                        : 'bg-[#daf3e2] text-[#16793d]'
                    }`}
                  >
                    1
                  </span>
                  <span
                    className={
                      step === 1
                        ? 'font-semibold text-[#143322]'
                        : 'font-medium text-[#5d6d64]'
                    }
                  >
                    Report Details
                  </span>
                </div>

                <span className="text-[#9eb0a6]">———&gt;</span>

                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      locationReady || step === 3
                        ? 'bg-[#1b8a44] text-white'
                        : 'bg-[#e6ece8] text-[#5d6d64]'
                    }`}
                  >
                    2
                  </span>
                  <span
                    className={
                      locationReady || step === 3
                        ? 'font-semibold text-[#143322]'
                        : 'font-medium text-[#5d6d64]'
                    }
                  >
                    Location &amp; Photo
                  </span>
                </div>

                <span className="text-[#9eb0a6]">———&gt;</span>

                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      step === 3
                        ? 'bg-[#1b8a44] text-white'
                        : 'bg-[#e6ece8] text-[#5d6d64]'
                    }`}
                  >
                    3
                  </span>
                  <span
                    className={
                      step === 3
                        ? 'font-semibold text-[#143322]'
                        : 'font-medium text-[#5d6d64]'
                    }
                  >
                    Review &amp; Submit
                  </span>
                </div>
              </div>

              {error && <StatusAlert variant="error" message={error} />}

              {step === 1 ? (
                <div className="rounded-xl border border-[#e5ece8] bg-white p-5 shadow-[0_2px_10px_rgba(16,42,28,0.04)] sm:p-6">
                  <div className="grid gap-6 lg:grid-cols-12">
                    {/* Left Column: Category + Description */}
                    <div className="space-y-6 lg:col-span-7">
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1b8a44] text-[11px] font-bold text-white">
                            1
                          </span>
                          <h2 className="text-sm font-bold text-[#14231b]">
                            Select Waste Category{' '}
                            <span className="text-red-500">*</span>
                          </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                          {CATEGORY_CARDS.map((card) => {
                            const Icon = card.icon;
                            const selected = category === card.key;
                            return (
                              <button
                                key={card.key}
                                type="button"
                                onClick={() => setCategory(card.key)}
                                className={`relative flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                                  selected
                                    ? 'border-2 border-[#249f50] bg-[#eefaf2] shadow-xs'
                                    : 'border-[#e2e8e4] bg-white hover:bg-[#f7faf8]'
                                }`}
                              >
                                {selected && (
                                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1b8a44] text-white shadow-xs">
                                    <Check className="h-3 w-3" />
                                  </span>
                                )}
                                <span
                                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}
                                >
                                  <Icon className="h-5 w-5" />
                                </span>
                                <span className="mt-2.5 text-[11.5px] font-semibold leading-tight text-[#14231b]">
                                  {card.title}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1b8a44] text-[11px] font-bold text-white">
                              2
                            </span>
                            <label
                              htmlFor="problem-description"
                              className="text-sm font-bold text-[#14231b]"
                            >
                              Describe the Problem{' '}
                              <span className="text-red-500">*</span>
                            </label>
                          </div>
                        </div>

                        <textarea
                          id="problem-description"
                          rows={5}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the waste issue, volume, nearby landmarks, and any concerns..."
                          className="w-full rounded-xl border border-[#dce4df] bg-[#f8fbf9] p-3.5 text-sm text-[#14231b] placeholder:text-[#86968d] focus:border-[#249f50] focus:bg-white focus:outline-none"
                        />
                        <div className="mt-1 flex items-center justify-between text-[11px] text-[#6b7b72]">
                          <span>Minimum 15 characters</span>
                          <span className="tabular-nums">
                            {description.trim().length} / 2000
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Map Location + Photo Upload */}
                    <div className="space-y-4 lg:col-span-5">
                      {/* Select Location on Map */}
                      <div className="rounded-xl border border-[#e3eae5] bg-[#fafcfa] p-3.5">
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-[#16a34a]" />
                            <span className="text-xs font-bold text-[#14231b]">
                              Select Location on Map{' '}
                              <span className="text-red-500">*</span>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleUseGeolocation}
                            disabled={geoLoading}
                            className="inline-flex h-7 items-center gap-1 rounded-full border border-[#dce4df] bg-white px-2.5 text-[11px] font-semibold text-[#16793d] shadow-xs hover:bg-[#f2f8f4]"
                          >
                            <Compass className="h-3 w-3" />
                            <span>
                              {geoLoading ? 'Locating...' : 'Use Current Location'}
                            </span>
                          </button>
                        </div>

                        <LocationPicker
                          latitude={latitude}
                          longitude={longitude}
                          heightClassName="h-40"
                          onChange={(lat, lng) => {
                            setLatitude(lat);
                            setLongitude(lng);
                            setPinTouched(true);
                          }}
                        />

                        {geoMessage && (
                          <p className="mt-1.5 text-[11px] text-[#5d6d64]">
                            {geoMessage}
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-[#dce4df] bg-white px-3 py-2">
                          <MapPin className="h-4 w-4 shrink-0 text-[#5d6d64]" />
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            disabled={showDetailedAddress}
                            placeholder="Enter address (e.g. Dhanmondi 27, Dhaka)"
                            className="w-full bg-transparent text-xs font-medium text-[#14231b] placeholder:text-[#86968d] focus:outline-none disabled:opacity-60"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowDetailedAddress((prev) => !prev)
                            }
                            title="Toggle structured address fields"
                            className="text-[#5d6d64] hover:text-[#16793d]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {showDetailedAddress && (
                          <div className="mt-2.5 grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              placeholder="Street / Road *"
                              className="h-8 rounded-lg border border-[#dce4df] bg-white px-2.5 text-xs focus:border-[#249f50] focus:outline-none"
                            />
                            <input
                              type="text"
                              value={area}
                              onChange={(e) => setArea(e.target.value)}
                              placeholder="Area / Block *"
                              className="h-8 rounded-lg border border-[#dce4df] bg-white px-2.5 text-xs focus:border-[#249f50] focus:outline-none"
                            />
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="City *"
                              className="h-8 rounded-lg border border-[#dce4df] bg-white px-2.5 text-xs focus:border-[#249f50] focus:outline-none"
                            />
                            <input
                              type="text"
                              value={ward}
                              onChange={(e) => setWard(e.target.value)}
                              placeholder="Ward / Zone"
                              className="h-8 rounded-lg border border-[#dce4df] bg-white px-2.5 text-xs focus:border-[#249f50] focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      {/* Upload Photograph */}
                      <div className="rounded-xl border border-[#e3eae5] bg-[#fafcfa] p-3.5">
                        <div className="mb-2.5 flex items-center gap-1.5">
                          <ImagePlus className="h-4 w-4 text-[#16a34a]" />
                          <span className="text-xs font-bold text-[#14231b]">
                            Upload Photograph{' '}
                            <span className="font-normal text-[#6b7b72]">
                              (Optional)
                            </span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          {photoPreview ? (
                            <div className="relative h-24 overflow-hidden rounded-lg border border-[#dce4df] bg-white">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photoPreview}
                                alt="Selected waste site"
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={handleRemovePhoto}
                                aria-label="Remove photograph"
                                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-slate-900"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex h-24 items-center justify-center rounded-lg border border-[#e5ece8] bg-white px-2 text-center text-[11px] text-[#86968d]">
                              No photo selected yet
                            </div>
                          )}

                          <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#c7d4cc] bg-white px-2 text-center transition-colors hover:border-[#249f50] hover:bg-[#f4faf6]">
                            <ImagePlus className="h-5 w-5 text-[#495b51]" />
                            <span className="mt-1 text-xs font-semibold text-[#14231b]">
                              {photoPreview ? 'Replace Photo' : 'Add Photo'}
                            </span>
                            <span className="text-[10px] text-[#6b7b72]">
                              JPG, PNG or WEBP (Max 5 MB)
                            </span>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handlePhotoSelect}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Buttons */}
                  <div className="mt-6 flex items-center justify-between border-t border-[#e8eeea] pt-4">
                    <Link
                      href="/citizen"
                      className="inline-flex h-10 items-center rounded-lg border border-[#dce4df] bg-white px-4 text-sm font-medium text-[#14231b] hover:bg-[#f4f7f5]"
                    >
                      Cancel
                    </Link>

                    <button
                      type="button"
                      onClick={handleProceedReview}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#16793d] px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#126232]"
                    >
                      <span>Next: Review &amp; Submit</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 3: Review & Submit */
                <form
                  onSubmit={handleSubmit}
                  className="mx-auto max-w-3xl rounded-xl border border-[#e5ece8] bg-white p-6 shadow-[0_2px_10px_rgba(16,42,28,0.04)]"
                >
                  <h2 className="text-base font-bold text-[#14231b]">
                    Review Report Details
                  </h2>
                  <p className="mt-0.5 text-xs text-[#5d6d64]">
                    Confirm your complaint information before submitting to
                    CleanCity dispatch.
                  </p>

                  <dl className="mt-5 space-y-4 border-y border-[#e8eeea] py-5 text-sm">
                    <div className="grid gap-1 sm:grid-cols-3">
                      <dt className="font-medium text-[#5d6d64]">Category</dt>
                      <dd className="font-semibold text-[#14231b] sm:col-span-2">
                        {CATEGORY_META[category].label}
                      </dd>
                    </div>
                    <div className="grid gap-1 sm:grid-cols-3">
                      <dt className="font-medium text-[#5d6d64]">
                        Description
                      </dt>
                      <dd className="text-[#14231b] sm:col-span-2">
                        {description.trim()}
                      </dd>
                    </div>
                    <div className="grid gap-1 sm:grid-cols-3">
                      <dt className="font-medium text-[#5d6d64]">Location</dt>
                      <dd className="text-[#14231b] sm:col-span-2">
                        <p className="font-medium">{resolvedAddress}</p>
                        {pinTouched &&
                          latitude !== null &&
                          longitude !== null && (
                            <p className="mt-0.5 font-mono text-xs text-[#5d6d64]">
                              Pin: {latitude}, {longitude}
                            </p>
                          )}
                      </dd>
                    </div>
                    {photoPreview && (
                      <div className="grid gap-2 sm:grid-cols-3">
                        <dt className="font-medium text-[#5d6d64]">
                          Photograph
                        </dt>
                        <dd className="sm:col-span-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoPreview}
                            alt="Attached waste site"
                            className="h-36 w-56 rounded-lg border border-[#dce4df] object-cover"
                          />
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={submitting}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#dce4df] bg-white px-4 text-sm font-medium text-[#14231b] hover:bg-[#f4f7f5]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Edit</span>
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#16793d] px-6 text-sm font-semibold text-white shadow-xs hover:bg-[#126232] disabled:opacity-60"
                    >
                      <span>
                        {submitting ? 'Submitting...' : 'Submit Waste Report'}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
