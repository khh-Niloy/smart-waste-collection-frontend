'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Camera,
  Lock,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
  UserCheck,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';
import { StatusAlert } from '@/components/ui/status-alert';
import { useAuth } from '@/contexts/auth-context';
import { getApiErrorMessage } from '@/lib/api';
import { formatShortDate } from '@/lib/formatters';
import { authService } from '@/services/auth.service';

type ProfileTab = 'personal' | 'password' | 'security';

function getInitials(name?: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function CitizenProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');

  const [editedFullName, setEditedFullName] = useState<string | null>(null);
  const [editedPhone, setEditedPhone] = useState<string | null>(null);
  const fullName = editedFullName ?? user?.fullName ?? '';
  const phone = editedPhone ?? user?.phone ?? '';
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters long.');
      return;
    }

    setSavingProfile(true);
    try {
      await authService.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      await refreshUser();
      setEditedFullName(null);
      setEditedPhone(null);
      setSuccessMsg('Personal information updated successfully.');
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'Unable to update profile.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!currentPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg(res.message);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'Unable to update password.'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleVerifySession = async () => {
    setVerifying(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const fresh = await refreshUser();
      if (fresh) {
        setSuccessMsg(`Active session confirmed for ${fresh.email}.`);
      }
    } catch {
      setErrorMsg('Session verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const initials = getInitials(user?.fullName);

  return (
    <ProtectedRoute allowedRoles={['CITIZEN']}>
      <AppShell>
        <div className="mx-auto max-w-5xl space-y-5">
          {/* Header */}
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#daf3e2] text-[#16793d]">
              <UserCheck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-[#143322]">
                Resident Profile
              </h1>
              <p className="text-sm text-[#5d6d64]">
                Manage your account information, password, and session.
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            {/* Left Summary Card */}
            <aside className="rounded-xl border border-[#e5ece8] bg-white p-6 text-center shadow-[0_2px_10px_rgba(16,42,28,0.04)] lg:col-span-4">
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#d3f2dd] text-2xl font-bold text-[#14532d]">
                <span>{initials}</span>
                <span className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border border-[#dce4df] bg-white text-[#495b51] shadow-xs">
                  <Camera className="h-3.5 w-3.5" />
                </span>
              </div>

              <h2 className="mt-4 text-lg font-bold text-[#14231b]">
                {user?.fullName}
              </h2>
              <span className="mt-1.5 inline-flex rounded-full bg-[#e2f7ea] px-3 py-0.5 text-xs font-semibold text-[#15803d]">
                Citizen
              </span>

              <div className="mt-6 space-y-3 border-t border-[#eef3ef] pt-5 text-left text-xs sm:text-[13px] text-[#35463c]">
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-[#5d6d64]" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-[#5d6d64]" />
                  <span>{user?.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 shrink-0 text-[#5d6d64]" />
                  <span>
                    Member since {formatShortDate(user?.createdAt)}
                  </span>
                </div>
              </div>
            </aside>

            {/* Right Tabs + Panel */}
            <div className="space-y-4 lg:col-span-8">
              {/* Segmented Tab Bar */}
              <div className="grid grid-cols-1 gap-1.5 rounded-xl border border-[#e5ece8] bg-white p-1.5 shadow-[0_2px_10px_rgba(16,42,28,0.04)] sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('personal');
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  className={`flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'personal'
                      ? 'bg-[#1b8a44] text-white'
                      : 'text-[#495b51] hover:bg-[#f4f7f5]'
                  }`}
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Personal Information</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('password');
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  className={`flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'password'
                      ? 'bg-[#1b8a44] text-white'
                      : 'text-[#495b51] hover:bg-[#f4f7f5]'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Change Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('security');
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  className={`flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'security'
                      ? 'bg-[#1b8a44] text-white'
                      : 'text-[#495b51] hover:bg-[#f4f7f5]'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Account &amp; Security</span>
                </button>
              </div>

              {successMsg && (
                <StatusAlert variant="success" message={successMsg} />
              )}
              {errorMsg && <StatusAlert variant="error" message={errorMsg} />}

              {/* Tab Content Card */}
              <div className="rounded-xl border border-[#e5ece8] bg-white p-6 shadow-[0_2px_10px_rgba(16,42,28,0.04)]">
                {activeTab === 'personal' && (
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-[#14231b]">
                        Personal Information
                      </h3>
                      <p className="text-xs text-[#5d6d64]">
                        Update your basic information.
                      </p>
                    </div>

                    <div className="grid gap-4 border-t border-[#eef3ef] pt-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="profile-fullname"
                          className="block text-xs font-semibold text-[#35463c]"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="profile-fullname"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setEditedFullName(e.target.value)}
                          className="mt-1.5 h-10 w-full rounded-lg border border-[#dce4df] bg-[#f8fbf9] px-3 text-sm text-[#14231b] focus:border-[#249f50] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="profile-phone"
                          className="block text-xs font-semibold text-[#35463c]"
                        >
                          Phone Number
                        </label>
                        <input
                          id="profile-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setEditedPhone(e.target.value)}
                          placeholder="+8801915910291"
                          className="mt-1.5 h-10 w-full rounded-lg border border-[#dce4df] bg-[#f8fbf9] px-3 text-sm text-[#14231b] focus:border-[#249f50] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditedFullName(null);
                          setEditedPhone(null);
                          setSuccessMsg(null);
                          setErrorMsg(null);
                        }}
                        className="h-9 rounded-lg border border-[#dce4df] bg-white px-4 text-xs font-semibold text-[#35463c] hover:bg-[#f4f7f5]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="h-9 rounded-lg bg-[#1b8a44] px-4 text-xs font-semibold text-white hover:bg-[#156f36] disabled:opacity-60"
                      >
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'password' && (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#14231b]">
                        Change Password
                      </h3>
                      <p className="text-xs text-[#5d6d64]">
                        Choose a strong password of at least 6 characters.
                      </p>
                    </div>

                    <div className="space-y-3 border-t border-[#eef3ef] pt-4">
                      <div>
                        <label
                          htmlFor="current-pw"
                          className="block text-xs font-semibold text-[#35463c]"
                        >
                          Current Password
                        </label>
                        <input
                          id="current-pw"
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="mt-1 h-10 w-full rounded-lg border border-[#dce4df] bg-[#f8fbf9] px-3 text-sm focus:border-[#249f50] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="new-pw"
                            className="block text-xs font-semibold text-[#35463c]"
                          >
                            New Password
                          </label>
                          <input
                            id="new-pw"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 h-10 w-full rounded-lg border border-[#dce4df] bg-[#f8fbf9] px-3 text-sm focus:border-[#249f50] focus:bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="confirm-pw"
                            className="block text-xs font-semibold text-[#35463c]"
                          >
                            Confirm Password
                          </label>
                          <input
                            id="confirm-pw"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 h-10 w-full rounded-lg border border-[#dce4df] bg-[#f8fbf9] px-3 text-sm focus:border-[#249f50] focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="h-9 rounded-lg bg-[#1b8a44] px-4 text-xs font-semibold text-white hover:bg-[#156f36] disabled:opacity-60"
                      >
                        {savingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#14231b]">
                        Account &amp; Security
                      </h3>
                      <p className="text-xs text-[#5d6d64]">
                        Verify your active session and manage sign-out.
                      </p>
                    </div>

                    <dl className="grid gap-4 border-y border-[#eef3ef] py-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-medium text-[#5d6d64]">
                          Account Role
                        </dt>
                        <dd className="mt-1 font-semibold text-[#16793d]">
                          {user?.role}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-[#5d6d64]">
                          Account Status
                        </dt>
                        <dd className="mt-1 font-semibold text-[#14231b]">
                          {user?.isActive ? 'Active' : 'Inactive'}
                        </dd>
                      </div>
                    </dl>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleVerifySession}
                        disabled={verifying}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dce4df] bg-white px-4 text-xs font-semibold text-[#14231b] hover:bg-[#f4f7f5] disabled:opacity-60"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${verifying ? 'animate-spin' : ''}`}
                        />
                        <span>
                          {verifying ? 'Verifying...' : 'Verify Active Session'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          await logout();
                          router.replace('/login');
                        }}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#f0c7c7] bg-[#fdf2f2] px-4 text-xs font-semibold text-[#b91c1c] hover:bg-[#fbe5e5]"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
