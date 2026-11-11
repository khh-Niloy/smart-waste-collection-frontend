'use client';

import Link from 'next/link';
import { ArrowRight, Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f3ee] text-[#171a17]">
      {/* Masthead */}
      <header className="border-b border-[#dddad1] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#133826] text-[#9fd4b5]">
              <Leaf className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-[#171a17]">
                CleanCity
              </p>
              <p className="hidden font-mono text-[10px] uppercase tracking-[0.08em] text-[#5a5f59] sm:block">
                Municipal Waste Authority
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2.5">
            {!isLoading && user ? (
              <Link
                href={user.role === 'ADMIN' ? '/admin' : '/citizen'}
                className="inline-flex h-9 items-center gap-2 rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white transition-colors hover:bg-[#14482e]"
              >
                <span>Open Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center rounded-sm border border-[#d1cec4] bg-white px-3.5 text-sm font-medium text-[#171a17] transition-colors hover:bg-[#faf9f6]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center rounded-sm bg-[#1b5e3c] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#14482e]"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Editorial Hero */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-5 py-12 sm:px-8 sm:py-16">
        <section className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#1b5e3c]">
            Public Sanitation &amp; Dispatch System
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.025em] text-[#171a17] sm:text-4xl">
            Report street waste problems and coordinate city collection crews.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5a5f59]">
            A unified municipal service desk for residents to log overflowing
            bins, illegal dumping, and missed pickups—and for city dispatchers
            to assign crews and verify resolution.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={
                user
                  ? user.role === 'ADMIN'
                    ? '/admin'
                    : '/citizen'
                  : '/register'
              }
              className="inline-flex h-10 items-center gap-2 rounded-sm bg-[#1b5e3c] px-5 text-sm font-medium text-white transition-colors hover:bg-[#14482e]"
            >
              <span>
                {user ? 'Continue to Workspace' : 'Create Citizen Account'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-sm border border-[#d1cec4] bg-white px-5 text-sm font-medium text-[#171a17] transition-colors hover:bg-[#faf9f6]"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Hairline Civic Index — No boxed cards */}
        <section className="mt-16 border-t border-[#dddad1] pt-8">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <div className="border-b border-[#dddad1] pb-6 md:border-b-0 md:border-r md:pr-10 md:pb-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                01 / Citizen Portal
              </p>
              <h2 className="mt-2 text-base font-semibold text-[#171a17]">
                Complaint Filing &amp; Status Tracking
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5a5f59]">
                Submit categorized reports with exact street addresses, site
                photographs, and map coordinates, and follow crew progress under
                a single tracking code.
              </p>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
                02 / Municipal Administration
              </p>
              <h2 className="mt-2 text-base font-semibold text-[#171a17]">
                Triage, Crew Dispatch &amp; Oversight
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5a5f59]">
                Filter incoming civic complaints by ward, priority, and status,
                assign active sanitation crews, and audit resolution timelines
                across the city.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
