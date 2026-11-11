'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Leaf } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusAlert } from '@/components/ui/status-alert';
import { useAuth } from '@/contexts/auth-context';
import { getApiErrorMessage } from '@/lib/api';

function LoginFormContent() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      const fallback = user.role === 'ADMIN' ? '/admin' : '/citizen';
      router.replace(redirectParam || fallback);
    }
  }, [user, isLoading, router, redirectParam]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      const authenticatedUser = await login({
        email: email.trim(),
        password,
      });
      const fallback =
        authenticatedUser.role === 'ADMIN' ? '/admin' : '/citizen';
      router.replace(redirectParam || fallback);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Checking session..." />;
  }

  return (
    <div className="grid min-h-screen bg-[#f4f3ee] lg:grid-cols-12">
      {/* Left Civic Anchor */}
      <aside className="flex flex-col justify-between bg-[#133826] px-6 py-8 text-white lg:col-span-5 lg:px-12 lg:py-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Leaf className="h-4 w-4 text-[#9fd4b5]" />
            <span className="text-sm font-semibold tracking-tight">
              CleanCity
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
        </div>

        <div className="my-10 lg:my-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#9fd4b5]">
            Portal Access
          </p>
          <h1 className="mt-3 text-2xl font-semibold leading-snug tracking-[-0.02em] sm:text-3xl">
            Municipal Waste &amp; Sanitation Desk
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
            Sign in with your citizen or municipal administrator credentials to
            manage reports and collection operations.
          </p>
        </div>

        <p className="hidden font-mono text-[11px] text-white/45 lg:block">
          CLEANCITY MUNICIPAL OPERATIONS
        </p>
      </aside>

      {/* Right Form Workspace */}
      <main className="flex items-center justify-center bg-white px-6 py-12 lg:col-span-7 lg:px-16">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-semibold tracking-[-0.015em] text-[#171a17]">
            Sign in to your account
          </h2>
          <p className="mt-1 text-sm text-[#5a5f59]">
            Enter your registered email and password below.
          </p>

          {error && (
            <div className="mt-5">
              <StatusAlert variant="error" message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-[0.04em] text-[#5a5f59]"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1.5 h-10 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm text-[#171a17] placeholder:text-[#8c908a] focus:border-[#1b5e3c] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-[0.04em] text-[#5a5f59]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1.5 h-10 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm text-[#171a17] placeholder:text-[#8c908a] focus:border-[#1b5e3c] focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 h-10 w-full rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white transition-colors hover:bg-[#14482e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 border-t border-[#eceae3] pt-5 text-sm text-[#5a5f59]">
            New citizen?{' '}
            <Link
              href="/register"
              className="font-medium text-[#1b5e3c] underline underline-offset-4 hover:text-[#14482e]"
            >
              Create a citizen account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<LoadingSpinner fullScreen label="Loading sign in..." />}
    >
      <LoginFormContent />
    </Suspense>
  );
}
