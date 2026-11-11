'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusAlert } from '@/components/ui/status-alert';
import { useAuth } from '@/contexts/auth-context';
import { getApiErrorMessage } from '@/lib/api';

export default function RegisterPage() {
  const { user, isLoading, register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === 'ADMIN' ? '/admin' : '/citizen');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters long.');
      return;
    }

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        password,
        confirmPassword,
      });
      router.replace('/citizen');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to create account.'));
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
            Citizen Enrollment
          </p>
          <h1 className="mt-3 text-2xl font-semibold leading-snug tracking-[-0.02em] sm:text-3xl">
            Register to report municipal waste issues
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
            Create a resident account to submit sanitation complaints, attach
            location coordinates, and follow team assignment updates.
          </p>
        </div>

        <p className="hidden font-mono text-[11px] text-white/45 lg:block">
          CLEANCITY MUNICIPAL OPERATIONS
        </p>
      </aside>

      {/* Right Form Workspace */}
      <main className="flex items-center justify-center bg-white px-6 py-10 lg:col-span-7 lg:px-16">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-semibold tracking-[-0.015em] text-[#171a17]">
            Create citizen account
          </h2>
          <p className="mt-1 text-sm text-[#5a5f59]">
            Complete your details to activate your portal access.
          </p>

          {error && (
            <div className="mt-5">
              <StatusAlert variant="error" message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5" noValidate>
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-medium uppercase tracking-[0.04em] text-[#5a5f59]"
              >
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Amina Rahman"
                className="mt-1.5 h-10 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm text-[#171a17] placeholder:text-[#8c908a] focus:border-[#1b5e3c] focus:bg-white focus:outline-none"
              />
            </div>

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
                placeholder="amina@example.com"
                className="mt-1.5 h-10 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm text-[#171a17] placeholder:text-[#8c908a] focus:border-[#1b5e3c] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-medium uppercase tracking-[0.04em] text-[#5a5f59]"
              >
                Phone number{' '}
                <span className="font-normal normal-case text-[#8c908a]">
                  (optional)
                </span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+8801711000000"
                className="mt-1.5 h-10 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm text-[#171a17] placeholder:text-[#8c908a] focus:border-[#1b5e3c] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  className="mt-1.5 h-10 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm text-[#171a17] placeholder:text-[#8c908a] focus:border-[#1b5e3c] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-medium uppercase tracking-[0.04em] text-[#5a5f59]"
                >
                  Confirm
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter"
                  className="mt-1.5 h-10 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm text-[#171a17] placeholder:text-[#8c908a] focus:border-[#1b5e3c] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 h-10 w-full rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white transition-colors hover:bg-[#14482e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating account...' : 'Register as Citizen'}
            </button>
          </form>

          <div className="mt-6 border-t border-[#eceae3] pt-5 text-sm text-[#5a5f59]">
            Already registered?{' '}
            <Link
              href="/login"
              className="font-medium text-[#1b5e3c] underline underline-offset-4 hover:text-[#14482e]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
