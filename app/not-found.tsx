import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center bg-[#f4f3ee] px-6 py-16">
      <div className="mx-auto w-full max-w-lg border-t-2 border-[#133826] pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#5a5f59]">
          HTTP 404 — Route Not Found
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#171a17]">
          The requested page could not be found.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#5a5f59]">
          The address may be mistyped or the resource may have been relocated.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white transition-colors hover:bg-[#14482e]"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
