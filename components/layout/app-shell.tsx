'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  Truck,
  UserCheck,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: string;
}

export function AppShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems: NavItem[] =
    user?.role === 'ADMIN'
      ? [
          {
            label: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
          },
          {
            label: 'All Reports',
            href: '/admin/reports',
            icon: ClipboardList,
            matchPrefix: '/admin/reports',
          },
          {
            label: 'Collection Teams',
            href: '/admin/teams',
            icon: Truck,
            matchPrefix: '/admin/teams',
          },
          {
            label: 'Map Monitoring',
            href: '/admin/map',
            icon: MapPin,
          },
          {
            label: 'Statistics',
            href: '/admin/statistics',
            icon: BarChart3,
          },
        ]
      : [
          {
            label: 'Dashboard',
            href: '/citizen',
            icon: LayoutDashboard,
          },
          {
            label: 'Report Waste',
            href: '/citizen/report',
            icon: FilePlus2,
          },
          {
            label: 'My Complaints',
            href: '/citizen/complaints',
            icon: ClipboardList,
            matchPrefix: '/citizen/complaints',
          },
          {
            label: 'Profile',
            href: '/citizen/profile',
            icon: UserCheck,
          },
        ];

  const isNavActive = (item: NavItem) => {
    if (item.matchPrefix) {
      return pathname === item.href || pathname.startsWith(`${item.matchPrefix}/`);
    }
    return pathname === item.href;
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f3ee] text-[#171a17]">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#1d4a34] bg-[#133826] px-4 py-3 text-white lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <Leaf className="h-4 w-4 text-[#9fd4b5]" />
          <span className="text-sm font-semibold tracking-tight">
            CleanCity
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="rounded-sm border border-white/20 p-1.5 text-white hover:bg-white/10"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </header>

      <div className="flex min-h-screen w-full">
        {/* Desktop Forest Rail */}
        <aside className="hidden w-60 shrink-0 flex-col bg-[#133826] text-white lg:flex">
          <Link
            href="/"
            className="flex items-center gap-2.5 border-b border-white/12 px-5 py-4.5 transition-colors hover:bg-white/5"
          >
            <Leaf className="h-4 w-4 text-[#9fd4b5]" />
            <div>
              <p className="text-sm font-semibold tracking-tight">CleanCity</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#9fd4b5]/80">
                Sanitation Authority
              </p>
            </div>
          </Link>

          <div className="px-5 pt-5 pb-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/45">
              {user?.role === 'ADMIN' ? 'Municipal Ops' : 'Resident Portal'}
            </p>
          </div>

          <nav className="flex-1 space-y-0.5 px-3" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-white/12 font-medium text-white'
                      : 'text-white/75 hover:bg-white/6 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 text-[#9fd4b5]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="border-t border-white/12 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#9fd4b5]">
                {user.role}
              </p>
              <p className="mt-1 truncate text-sm font-medium text-white">
                {user.fullName}
              </p>
              <p className="truncate text-xs text-white/60">{user.email}</p>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-sm border border-white/20 bg-transparent px-3 text-xs font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{loggingOut ? 'Signing out...' : 'Sign out'}</span>
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div
              className="fixed inset-0 bg-[#171a17]/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 flex w-64 flex-col bg-[#133826] p-4 text-white">
              <div className="mb-4 flex items-center justify-between border-b border-white/12 pb-3">
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-[#9fd4b5]">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-sm p-1 text-white/75 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm ${
                        active
                          ? 'bg-white/12 font-medium text-white'
                          : 'text-white/75 hover:bg-white/6 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-[#9fd4b5]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              {user && (
                <div className="border-t border-white/12 pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#9fd4b5]">
                    {user.role}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium">
                    {user.fullName}
                  </p>
                  <p className="truncate text-xs text-white/60">{user.email}</p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-sm border border-white/20 px-3 text-xs font-medium text-white hover:bg-white/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{loggingOut ? 'Signing out...' : 'Sign out'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Workspace */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dddad1] bg-white px-6 py-5 lg:px-10">
            <div>
              <h1 className="text-lg font-semibold tracking-[-0.015em] text-[#171a17] sm:text-xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 text-sm text-[#5a5f59]">{subtitle}</p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
          <main className="flex-1 px-6 py-7 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
