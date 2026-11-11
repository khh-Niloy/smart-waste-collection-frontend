'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  Leaf,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  ShieldCheck,
  Truck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import {
  PublicSummary,
  statisticsService,
} from '@/services/statistics.service';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [publicStats, setPublicStats] = useState<PublicSummary | null>(null);

  useEffect(() => {
    let active = true;
    void statisticsService
      .getPublicSummary()
      .then((data) => {
        if (active) setPublicStats(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const primaryHref = user
    ? user.role === 'ADMIN'
      ? '/admin'
      : '/citizen'
    : '/register';

  return (
    <div className="min-h-screen bg-[#f4f8f5] text-[#111e16]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#e5ece8] bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7f7ec] text-[#16a34a]">
              <Leaf className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-[17px] font-bold tracking-tight text-[#111e16]">
                CleanCity
              </p>
              <p className="hidden text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5d6d64] sm:block">
                Municipal Waste Authority
              </p>
            </div>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary navigation"
          >
            <Link
              href="/"
              className="rounded-lg bg-[#e8f5ec] px-3.5 py-1.5 text-sm font-semibold text-[#156d38]"
            >
              Home
            </Link>
            <a
              href="#about"
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-[#35463c] transition-colors hover:bg-[#f2f7f4]"
            >
              About
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-[#35463c] transition-colors hover:bg-[#f2f7f4]"
            >
              How It Works
            </a>
            <a
              href="#services"
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-[#35463c] transition-colors hover:bg-[#f2f7f4]"
            >
              Services
            </a>
            <a
              href="#contact"
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-[#35463c] transition-colors hover:bg-[#f2f7f4]"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {!isLoading && user ? (
              <Link
                href={user.role === 'ADMIN' ? '/admin' : '/citizen'}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#16793d] px-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#126232]"
              >
                <span>Open Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center rounded-lg border border-[#d6e0da] bg-white px-4 text-sm font-semibold text-[#111e16] transition-colors hover:bg-[#f7faf8]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#16793d] px-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#126232]"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f8fcf9] via-[#f2faf4] to-[#e8f5ec] pt-8 pb-16 sm:pt-12 sm:pb-20">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1c7c41]">
              Public Sanitation &amp; Dispatch System
            </p>
            <h1 className="mt-3 text-[30px] font-extrabold leading-[1.15] tracking-[-0.025em] text-[#111e16] sm:text-[40px]">
              Report street waste problems and coordinate city collection crews.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#4b5d53]">
              A unified municipal service desk for residents to log overflowing
              bins, illegal dumping, and missed pickups—and for city dispatchers
              to assign crews and verify resolution.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={primaryHref}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#16793d] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#126232]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>
                  {user ? 'Go to Dashboard' : 'Create Citizen Account'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-lg border border-[#d6e0da] bg-white px-6 text-sm font-semibold text-[#111e16] transition-colors hover:bg-[#f7faf8]"
              >
                Sign In
              </Link>
              <Link
                href="/login?role=admin"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#133826]/25 bg-[#133826]/5 px-5 text-sm font-semibold text-[#133826] transition-colors hover:bg-[#133826] hover:text-white"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Login</span>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#2c4034]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#1b8a44]" />
                <span>Report Issues Easily</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#1b8a44]" />
                <span>Track Resolution</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#1b8a44]" />
                <span>Cleaner &amp; Healthier City</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-sanitation.jpg"
                alt="Municipal sanitation worker collecting a bottle beside a green recycling bin"
                className="w-full rounded-2xl object-cover [mask-image:radial-gradient(ellipse_at_center,black_72%,transparent_100%)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Feature Cards + CleanCity in Action */}
      <div className="relative z-10 mx-auto -mt-8 max-w-6xl space-y-5 px-5 pb-12 sm:px-8">
        <section id="services" className="grid gap-5 md:grid-cols-3">
          <Link
            href={user?.role === 'ADMIN' ? '/admin/reports' : '/citizen/report'}
            className="group flex items-start justify-between gap-3 rounded-2xl border border-[#e3ebe6] bg-white p-5 shadow-[0_6px_24px_rgba(16,42,28,0.05)] transition-all hover:border-[#b7d9c2]"
          >
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7f8ed] text-[#1d9a48]">
                <FilePlus2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-[14.5px] font-bold text-[#111e16]">
                  Complaint Filing &amp; Status Tracking
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#5d6d64]">
                  Submit categorized reports with exact street addresses, site
                  photographs, and map coordinates.
                </p>
              </div>
            </div>
            <ArrowRight className="mt-5 h-4 w-4 shrink-0 text-[#16793d] transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href={user?.role === 'ADMIN' ? '/admin/reports' : '/login'}
            className="group flex items-start justify-between gap-3 rounded-2xl border border-[#e3ebe6] bg-white p-5 shadow-[0_6px_24px_rgba(16,42,28,0.05)] transition-all hover:border-[#b7d9c2]"
          >
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7f8ed] text-[#1d9a48]">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-[14.5px] font-bold text-[#111e16]">
                  Triage, Crew Dispatch &amp; Oversight
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#5d6d64]">
                  Filter incoming complaints by waste, priority, and zone,
                  assign collection crews, and audit resolution.
                </p>
              </div>
            </div>
            <ArrowRight className="mt-5 h-4 w-4 shrink-0 text-[#16793d] transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href={user?.role === 'ADMIN' ? '/admin/statistics' : '/login'}
            className="group flex items-start justify-between gap-3 rounded-2xl border border-[#e3ebe6] bg-white p-5 shadow-[0_6px_24px_rgba(16,42,28,0.05)] transition-all hover:border-[#b7d9c2]"
          >
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7f8ed] text-[#1d9a48]">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-[14.5px] font-bold text-[#111e16]">
                  City Cleanliness Insights
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#5d6d64]">
                  Monitor waste reports, collection progress, and overall
                  sanitation performance across the city.
                </p>
              </div>
            </div>
            <ArrowRight className="mt-5 h-4 w-4 shrink-0 text-[#16793d] transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>

        {/* CleanCity in Action Bar */}
        <section
          id="about"
          className="grid items-center gap-6 rounded-2xl border border-[#e3ebe6] bg-white px-6 py-5 shadow-[0_6px_24px_rgba(16,42,28,0.05)] lg:grid-cols-12"
        >
          <div className="lg:col-span-4">
            <h2 className="text-lg font-bold text-[#14532d]">
              CleanCity in Action
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#5d6d64]">
              A cleaner city through community participation and faster
              response.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:col-span-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f7ee] text-[#1d9a48]">
                <ClipboardList className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xl font-extrabold tabular-nums text-[#111e16]">
                  {publicStats ? publicStats.totalReports : 0}
                </p>
                <p className="text-xs text-[#5d6d64]">Total Reports</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f7ee] text-[#1d9a48]">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xl font-extrabold tabular-nums text-[#111e16]">
                  {publicStats ? publicStats.resolvedReports : 0}
                </p>
                <p className="text-xs text-[#5d6d64]">Resolved</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f7ee] text-[#1d9a48]">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xl font-extrabold tabular-nums text-[#111e16]">
                  {publicStats ? publicStats.activeCrews : 0}
                </p>
                <p className="text-xs text-[#5d6d64]">Active Crews</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f7ee] text-[#1d9a48]">
                <Leaf className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xl font-extrabold tabular-nums text-[#111e16]">
                  {publicStats ? `${publicStats.resolutionRate}%` : '0%'}
                </p>
                <p className="text-xs text-[#5d6d64]">Resolution Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="rounded-2xl border border-[#e3ebe6] bg-white p-6 shadow-[0_2px_12px_rgba(16,42,28,0.03)]"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#16793d]">
            How It Works
          </p>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-bold text-[#16793d]">
                01. Log the Waste Issue
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#5d6d64]">
                Select a category, enter your street address or pin on the map,
                and attach a site photograph.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#16793d]">
                02. Priority Triage &amp; Dispatch
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#5d6d64]">
                Automated classification flags urgent hazards while municipal
                dispatchers assign nearby collection teams.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#16793d]">
                03. Transparent Resolution
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#5d6d64]">
                Follow every status update from acknowledgement through field
                clearance using your tracking code.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer / Contact */}
      <footer
        id="contact"
        className="border-t border-[#e5ece8] bg-white py-6 text-xs text-[#5d6d64]"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-2 font-semibold text-[#111e16]">
            <Leaf className="h-4 w-4 text-[#16793d]" />
            <span>CleanCity Municipal Waste Authority</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#16793d]" />
              <span>Nagar Bhaban Operations Desk</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#16793d]" />
              <span>+880-2-9556014</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#16793d]" />
              <span>support@cleancity.local</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
