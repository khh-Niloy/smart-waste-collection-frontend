'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Power, X } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';
import {
  PriorityBadge,
  StatusBadge,
} from '@/components/reports/status-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusAlert } from '@/components/ui/status-alert';
import { getApiErrorMessage } from '@/lib/api';
import { CATEGORY_META, formatShortDate } from '@/lib/formatters';
import { teamsService } from '@/services/teams.service';
import { CollectionTeam, CollectionTeamDetail } from '@/types/domain';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<CollectionTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingTeam, setEditingTeam] = useState<CollectionTeam | null>(null);
  const [selectedTeamDetail, setSelectedTeamDetail] =
    useState<CollectionTeamDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadTeams = useCallback(async () => {
    try {
      const data = await teamsService.list();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load collection teams.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      try {
        const data = await teamsService.list();
        if (active) {
          setTeams(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            getApiErrorMessage(err, 'Failed to load collection teams.'),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    void fetchInitial();
    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setTeamName('');
    setContactPerson('');
    setPhone('');
    setServiceArea('');
    setEditingTeam(null);
    setShowCreateForm(false);
  };

  const handleOpenCreate = () => {
    setEditingTeam(null);
    setTeamName('');
    setContactPerson('');
    setPhone('');
    setServiceArea('');
    setShowCreateForm(true);
  };

  const handleOpenEdit = (team: CollectionTeam) => {
    setEditingTeam(team);
    setTeamName(team.teamName);
    setContactPerson(team.contactPerson);
    setPhone(team.phone);
    setServiceArea(team.serviceArea);
    setShowCreateForm(true);
  };

  const handleSaveTeam = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (
      !teamName.trim() ||
      !contactPerson.trim() ||
      !phone.trim() ||
      !serviceArea.trim()
    ) {
      setError('All collection team fields are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingTeam) {
        await teamsService.update(editingTeam._id, {
          teamName: teamName.trim(),
          contactPerson: contactPerson.trim(),
          phone: phone.trim(),
          serviceArea: serviceArea.trim(),
        });
        setMessage(`Updated "${teamName.trim()}".`);
      } else {
        await teamsService.create({
          teamName: teamName.trim(),
          contactPerson: contactPerson.trim(),
          phone: phone.trim(),
          serviceArea: serviceArea.trim(),
        });
        setMessage(`Created collection team "${teamName.trim()}".`);
      }
      resetForm();
      await loadTeams();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save collection team.'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (team: CollectionTeam) => {
    setError(null);
    setMessage(null);
    try {
      await teamsService.updateStatus(team._id, !team.isActive);
      setMessage(
        `${team.teamName} is now ${!team.isActive ? 'active' : 'inactive'}.`,
      );
      await loadTeams();
      if (selectedTeamDetail?._id === team._id) {
        const refreshed = await teamsService.getById(team._id);
        setSelectedTeamDetail(refreshed);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update team status.'));
    }
  };

  const handleInspectTeam = async (teamId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await teamsService.getById(teamId);
      setSelectedTeamDetail(detail);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load assigned reports.'));
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell
        title="Collection Teams"
        subtitle="Manage sanitation crews, service zones, activation status, and active workload"
        action={
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex h-9 items-center gap-2 rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white hover:bg-[#14482e]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Collection Team</span>
          </button>
        }
      >
        <div className="max-w-6xl space-y-6">
          {message && <StatusAlert variant="success" message={message} />}
          {error && <StatusAlert variant="error" message={error} />}

          {showCreateForm && (
            <form
              onSubmit={handleSaveTeam}
              className="space-y-4 rounded-sm border border-[#133826] bg-white p-5"
            >
              <div className="flex items-center justify-between border-b border-[#eceae3] pb-3">
                <h2 className="text-sm font-semibold text-[#171a17]">
                  {editingTeam
                    ? `Edit ${editingTeam.teamName}`
                    : 'Create Collection Team'}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-sm p-1 text-[#5a5f59] hover:bg-[#faf9f6]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="teamName"
                    className="block text-xs font-medium uppercase text-[#5a5f59]"
                  >
                    Team Name
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Zone A Rapid Sanitation Unit"
                    className="mt-1 h-9 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm focus:border-[#1b5e3c] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contactPerson"
                    className="block text-xs font-medium uppercase text-[#5a5f59]"
                  >
                    Contact Person
                  </label>
                  <input
                    id="contactPerson"
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Tariq Mahmud"
                    className="mt-1 h-9 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm focus:border-[#1b5e3c] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="teamPhone"
                    className="block text-xs font-medium uppercase text-[#5a5f59]"
                  >
                    Phone
                  </label>
                  <input
                    id="teamPhone"
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+8801711223344"
                    className="mt-1 h-9 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm focus:border-[#1b5e3c] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="serviceArea"
                    className="block text-xs font-medium uppercase text-[#5a5f59]"
                  >
                    Service Area
                  </label>
                  <input
                    id="serviceArea"
                    type="text"
                    required
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="Dhanmondi & Ward 15"
                    className="mt-1 h-9 w-full rounded-sm border border-[#d1cec4] bg-[#faf9f6] px-3 text-sm focus:border-[#1b5e3c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 rounded-sm bg-[#1b5e3c] px-4 text-sm font-medium text-white hover:bg-[#14482e] disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingTeam
                      ? 'Save Changes'
                      : 'Create Team'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-9 rounded-sm border border-[#d1cec4] px-4 text-sm font-medium text-[#171a17] hover:bg-[#faf9f6]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-sm border border-[#dddad1] bg-white">
            {loading ? (
              <div className="px-5">
                <LoadingSpinner label="Loading collection teams..." />
              </div>
            ) : teams.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-[#5a5f59]">
                No collection teams configured yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#dddad1] bg-[#faf9f6] font-mono text-[11px] uppercase tracking-[0.06em] text-[#5a5f59]">
                      <th className="px-4 py-2.5 font-medium">Team</th>
                      <th className="px-4 py-2.5 font-medium">Contact</th>
                      <th className="px-4 py-2.5 font-medium">Service Area</th>
                      <th className="px-4 py-2.5 font-medium">Active Load</th>
                      <th className="px-4 py-2.5 font-medium">Total</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceae3]">
                    {teams.map((team) => (
                      <tr key={team._id} className="hover:bg-[#faf9f6]">
                        <td className="px-4 py-3 font-medium text-[#171a17]">
                          {team.teamName}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[#171a17]">{team.contactPerson}</p>
                          <p className="font-mono text-xs text-[#5a5f59]">
                            {team.phone}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-[#5a5f59]">
                          {team.serviceArea}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs tabular-nums">
                          {team.activeWorkloadCount ?? 0}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#5a5f59]">
                          {team.assignedReportCount ?? 0}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          <span
                            className={
                              team.isActive
                                ? 'font-semibold text-[#1b5e3c]'
                                : 'text-[#8c908a]'
                            }
                          >
                            {team.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleInspectTeam(team._id)}
                              className="text-xs font-medium text-[#1b5e3c] underline underline-offset-4 hover:text-[#14482e]"
                            >
                              Assignments
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(team)}
                              className="inline-flex h-7 items-center gap-1 rounded-sm border border-[#d1cec4] px-2 text-xs text-[#171a17] hover:bg-[#faf9f6]"
                            >
                              <Pencil className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(team)}
                              className={`inline-flex h-7 items-center gap-1 rounded-sm border px-2 text-xs ${
                                team.isActive
                                  ? 'border-[#e7c5c5] text-[#7f1d1d] hover:bg-[#fdf6f5]'
                                  : 'border-[#cfe0d5] text-[#133826] hover:bg-[#f1f7f3]'
                              }`}
                            >
                              <Power className="h-3 w-3" />
                              <span>
                                {team.isActive ? 'Deactivate' : 'Activate'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {(loadingDetail || selectedTeamDetail) && (
            <section className="rounded-sm border border-[#dddad1] bg-white p-5">
              <div className="mb-3 flex items-center justify-between border-b border-[#eceae3] pb-3">
                <div>
                  <p className="font-mono text-[11px] uppercase text-[#5a5f59]">
                    Team Assignments
                  </p>
                  <h3 className="text-sm font-semibold text-[#171a17]">
                    {selectedTeamDetail?.teamName} (
                    {selectedTeamDetail?.serviceArea})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTeamDetail(null)}
                  className="text-xs text-[#5a5f59] hover:text-[#171a17]"
                >
                  Close
                </button>
              </div>

              {loadingDetail ? (
                <LoadingSpinner label="Loading assigned reports..." />
              ) : selectedTeamDetail &&
                selectedTeamDetail.assignedReports.length === 0 ? (
                <p className="text-sm text-[#5a5f59]">
                  No reports have been assigned to this team yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#eceae3] font-mono text-[11px] uppercase text-[#5a5f59]">
                        <th className="py-2 pr-4">Tracking #</th>
                        <th className="py-2 pr-4">Category</th>
                        <th className="py-2 pr-4">Address</th>
                        <th className="py-2 pr-4">Priority</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eceae3]">
                      {selectedTeamDetail?.assignedReports.map((r) => (
                        <tr key={r._id}>
                          <td className="py-2.5 pr-4 font-mono text-xs font-semibold">
                            <Link
                              href={`/admin/reports/${r._id}`}
                              className="text-[#1b5e3c] underline"
                            >
                              {r.reportCode}
                            </Link>
                          </td>
                          <td className="py-2.5 pr-4">
                            {CATEGORY_META[r.category].shortLabel}
                          </td>
                          <td className="max-w-xs truncate py-2.5 pr-4 text-[#5a5f59]">
                            {r.address}
                          </td>
                          <td className="py-2.5 pr-4">
                            <PriorityBadge priority={r.priority} />
                          </td>
                          <td className="py-2.5 pr-4">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="py-2.5 font-mono text-xs text-[#5a5f59]">
                            {formatShortDate(r.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
