'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  FilePlus2,
  Home,
  Leaf,
  List,
  LogOut,
  MapPin,
  Menu,
  Search,
  Truck,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: string;
}

function getInitials(name?: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function SidebarCityIllustration() {
  return (
    <div className="pointer-events-none select-none overflow-hidden px-1 pt-2">
      <svg
        viewBox="0 0 220 112"
        className="h-28 w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Subtle City Skyline */}
        <rect x="24" y="34" width="16" height="58" rx="1" fill="#175B38" opacity="0.55" />
        <rect x="44" y="20" width="22" height="72" rx="1" fill="#1A653E" opacity="0.6" />
        <rect x="70" y="38" width="18" height="54" rx="1" fill="#175B38" opacity="0.5" />
        <rect x="134" y="14" width="22" height="78" rx="1" fill="#1A653E" opacity="0.6" />
        <rect x="160" y="28" width="20" height="64" rx="1" fill="#175B38" opacity="0.55" />
        {/* Building Windows */}
        <rect x="49" y="27" width="4" height="4" fill="#328F5A" opacity="0.7" />
        <rect x="57" y="27" width="4" height="4" fill="#328F5A" opacity="0.7" />
        <rect x="49" y="36" width="4" height="4" fill="#328F5A" opacity="0.7" />
        <rect x="57" y="36" width="4" height="4" fill="#328F5A" opacity="0.7" />
        <rect x="139" y="22" width="4" height="4" fill="#328F5A" opacity="0.7" />
        <rect x="147" y="22" width="4" height="4" fill="#328F5A" opacity="0.7" />
        <rect x="139" y="31" width="4" height="4" fill="#328F5A" opacity="0.7" />
        <rect x="147" y="31" width="4" height="4" fill="#328F5A" opacity="0.7" />

        {/* Trees */}
        <circle cx="24" cy="70" r="15" fill="#2F8D48" />
        <circle cx="40" cy="76" r="11" fill="#39A353" />
        <circle cx="176" cy="72" r="16" fill="#2F8D48" />
        <circle cx="194" cy="78" r="11" fill="#39A353" />

        {/* Rolling Green Ground */}
        <path
          d="M0 95C45 81 112 78 220 92V112H0V95Z"
          fill="#63B857"
          opacity="0.95"
        />
        <path
          d="M0 100C65 92 145 90 220 102V112H0V100Z"
          fill="#4CA446"
          opacity="0.9"
        />

        {/* Recycling Bin */}
        <rect x="92" y="56" width="36" height="40" rx="4" fill="#22A84B" />
        <rect x="89" y="51" width="42" height="7" rx="3" fill="#2CC55B" />
        <rect x="103" y="47" width="14" height="4" rx="2" fill="#187E37" />
        <circle cx="110" cy="76" r="9" fill="#FFFFFF" opacity="0.2" />
        <path
          d="M110 70L114 75H106L110 70ZM105 78H115L110 83L105 78Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  action,
  children,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const navItems: NavItem[] =
    user?.role === 'ADMIN'
      ? [
          { label: 'Dashboard', href: '/admin', icon: Home },
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
          { label: 'Map Monitoring', href: '/admin/map', icon: MapPin },
          { label: 'Statistics', href: '/admin/statistics', icon: BarChart3 },
        ]
      : [
          { label: 'Dashboard', href: '/citizen', icon: Home },
          { label: 'Report Waste', href: '/citizen/report', icon: FilePlus2 },
          {
            label: 'My Complaints',
            href: '/citizen/complaints',
            icon: ClipboardList,
            matchPrefix: '/citizen/complaints',
          },
          { label: 'Profile', href: '/citizen/profile', icon: UserIcon },
        ];

  const isNavActive = (item: NavItem) => {
    if (item.matchPrefix) {
      return (
        pathname === item.href || pathname.startsWith(`${item.matchPrefix}/`)
      );
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

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const targetBase =
      user?.role === 'ADMIN' ? '/admin/reports' : '/citizen/complaints';
    const trimmed = searchQuery.trim();
    router.push(
      trimmed
        ? `${targetBase}?search=${encodeURIComponent(trimmed)}`
        : targetBase,
    );
  };

  const initials = getInitials(user?.fullName);

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#14231b]">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#184b31] bg-[#0c3d25] px-4 py-3 text-white lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#24b259] text-[#092e1c]">
            <Leaf className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <span className="block text-sm font-bold tracking-tight">
              CleanCity
            </span>
            <span className="block text-[9px] uppercase tracking-[0.12em] text-emerald-200/75">
              Sanitation Authority
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="rounded-lg border border-white/15 p-1.5 text-white hover:bg-white/10"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>

      <div className="flex min-h-screen w-full">
        {/* Desktop Forest Sidebar */}
        <aside
          className={`hidden shrink-0 flex-col bg-gradient-to-b from-[#0b3e26] via-[#0b3822] to-[#082919] text-white transition-all duration-200 lg:flex ${
            sidebarCollapsed ? 'w-[76px]' : 'w-[228px]'
          }`}
        >
          {/* Brand Row */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#24b259] text-[#092e1c] shadow-sm">
                <Leaf className="h-4 w-4" />
              </span>
              {!sidebarCollapsed && (
                <div className="leading-tight">
                  <p className="text-[17px] font-bold tracking-tight text-white">
                    CleanCity
                  </p>
                  <p className="text-[9px] font-medium uppercase tracking-[0.13em] text-[#9ecab0]">
                    Sanitation Authority
                  </p>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              aria-label="Toggle sidebar width"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
            >
              {sidebarCollapsed ? (
                <ChevronsRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronsLeft className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="px-4 pt-5 pb-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9ecab0]/70">
                {user?.role === 'ADMIN' ? 'Municipal Ops' : 'Resident Portal'}
              </p>
            </div>
          )}

          {/* Navigation Items */}
          <nav
            className="flex-1 space-y-1 px-3 pt-1"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#2eb85c] to-[#23994b] font-semibold text-white shadow-[0_2px_10px_rgba(35,153,75,0.35)]'
                      : 'font-medium text-white/80 hover:bg-white/10 hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom City/Bin Vector Illustration */}
          {!sidebarCollapsed && <SidebarCityIllustration />}

          {/* Bottom User Profile Box */}
          {user && (
            <div className="p-3 pt-1">
              <div className="rounded-xl border border-white/10 bg-[#082718]/90 p-3">
                <div
                  className={`flex items-center gap-2.5 ${
                    sidebarCollapsed ? 'justify-center' : ''
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#249f50] text-xs font-bold text-white">
                    {initials}
                  </span>
                  {!sidebarCollapsed && (
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white">
                        {user.fullName}
                      </p>
                      <p className="truncate text-[10px] text-[#9ecab0]/75">
                        {user.email}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="mt-3 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 text-xs font-medium text-white/90 transition-colors hover:bg-white/12 disabled:opacity-60"
                >
                  <LogOut className="h-3.5 w-3.5 text-[#f08b65]" />
                  {!sidebarCollapsed && (
                    <span>{loggingOut ? 'Signing out...' : 'Logout'}</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div
              className="fixed inset-0 bg-[#0b2518]/60"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 flex w-64 flex-col bg-[#0b3b24] p-4 text-white">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-bold">CleanCity</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1 text-white/80 hover:bg-white/10"
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
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                        active
                          ? 'bg-[#2eb85c] font-semibold text-white'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/20 text-xs font-medium text-white hover:bg-white/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{loggingOut ? 'Signing out...' : 'Logout'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Content Column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Utility Bar */}
          <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-[#e4ebe7] bg-white px-6 lg:flex">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((c) => !c)}
                className="rounded-lg p-1.5 text-[#495b51] hover:bg-[#f2f6f4]"
                aria-label="Toggle sidebar"
              >
                <List className="h-4 w-4" />
              </button>

              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[#7c8c83]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports by code, category..."
                  className="h-9 w-80 rounded-lg border border-[#dce4df] bg-[#f7faf8] pr-12 pl-9 text-xs text-[#14231b] placeholder:text-[#7c8c83] focus:border-[#249f50] focus:bg-white focus:outline-none"
                />
                <kbd className="pointer-events-none absolute top-2 right-2.5 rounded border border-[#dce4df] bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium text-[#6c7b73]">
                  ⌘ K
                </kbd>
              </form>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={
                  user?.role === 'ADMIN'
                    ? '/admin/reports'
                    : '/citizen/complaints'
                }
                aria-label="View complaints"
                className="relative rounded-lg p-2 text-[#495b51] hover:bg-[#f2f6f4]"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-white" />
              </Link>

              <div className="h-6 w-px bg-[#e4ebe7]" />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2.5 rounded-lg py-1 pr-1 pl-1 hover:bg-[#f6f9f7]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#daf3e2] text-xs font-bold text-[#17793d]">
                    {initials}
                  </span>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-semibold text-[#14231b]">
                      {user?.fullName}
                    </p>
                    <p className="text-[11px] text-[#6b7b72]">
                      {user?.role === 'ADMIN' ? 'Administrator' : 'Citizen'}
                    </p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-[#6b7b72]" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-lg border border-[#e4ebe7] bg-white py-1 shadow-lg">
                    <Link
                      href={
                        user?.role === 'ADMIN'
                          ? '/admin'
                          : '/citizen/profile'
                      }
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3.5 py-2 text-xs font-medium text-[#14231b] hover:bg-[#f4f7f5]"
                    >
                      {user?.role === 'ADMIN' ? 'Dashboard' : 'My Profile'}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-3.5 py-2 text-left text-xs font-medium text-[#b91c1c] hover:bg-[#fdf2f2]"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Page Content */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-7">
            {(title || action) && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  {title && (
                    <h1 className="text-[22px] font-bold tracking-tight text-[#143322] sm:text-[25px]">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="mt-0.5 text-sm text-[#5d6d64]">{subtitle}</p>
                  )}
                </div>
                {action && <div>{action}</div>}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
