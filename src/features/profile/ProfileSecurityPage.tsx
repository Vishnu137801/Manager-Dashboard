import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Shield, UserCheck } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { ActivityTimeline } from '../../components/ui/ActivityTimeline';
import { AvatarBadge } from '../../components/ui/AvatarBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Permission } from '../../types';

type ProfileSectionTab = 'profile' | 'workload' | 'security';

export const ProfileSecurityPage: React.FC = () => {
  const {
    currentManager,
    activeRole,
    switchActiveRole,
    scopedEmployees,
    scopedTasks,
    pendingApprovalsCount,
    auditLogs,
    pushToast,
  } = useApp();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<ProfileSectionTab>('profile');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'workload' || t === 'security' || t === 'profile') {
      setTab(t);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#0B1230]">Manager Profile, Roles & Security</h1>
        <p className="text-xs text-[#5A627A] mt-0.5">
          View assigned supervisor roles, active permission matrix, personal workload, and login history
        </p>
      </div>

      <div className="inline-flex items-center gap-1 p-1 bg-white border border-[#E4E6F0] rounded-xl">
        {[
          { id: 'profile' as const, label: 'My Profile & Roles', icon: UserCheck },
          { id: 'workload' as const, label: 'My Workload & Activity', icon: Activity },
          { id: 'security' as const, label: 'Login History & Security', icon: Shield },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                tab === t.id ? 'bg-[#7050F5] text-white' : 'text-[#5A627A] hover:text-[#0B1230]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white border border-[#E4E6F0] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3.5">
              <AvatarBadge name={currentManager.name} src={currentManager.avatarUrl} size="lg" />
              <div>
                <h2 className="text-base font-bold text-[#0B1230]">{currentManager.name}</h2>
                <p className="text-xs text-[#5A627A]">{currentManager.designation}</p>
                <p className="text-xs text-[#7050F5] font-medium mt-0.5">{currentManager.email}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EEF0F7] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5A627A]">Primary Location</span>
                <span className="font-semibold text-[#0B1230]">{currentManager.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A627A]">Authorised Headcount</span>
                <span className="font-semibold text-[#0B1230] tabular-nums">{scopedEmployees.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A627A]">Last Session</span>
                <span className="font-semibold text-[#0B1230] tabular-nums">{currentManager.lastLogin}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-[#E4E6F0] rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0B1230]">Assigned Roles & Permission Boundary</h3>
              <p className="text-xs text-[#5A627A]">Switch active role context or inspect granted operational permissions</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {currentManager.roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => switchActiveRole(r)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    activeRole === r
                      ? 'bg-[#7050F5] text-white border-[#7050F5]'
                      : 'bg-[#F7F7FC] text-[#0B1230] border-[#E4E6F0] hover:border-[#7050F5]/50'
                  }`}
                >
                  {r} {activeRole === r ? '(Active)' : ''}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[#EEF0F7]">
              <p className="text-xs font-semibold text-[#0B1230] mb-2.5">Permission Matrix</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                {Object.values(Permission).map((perm) => {
                  const granted = currentManager.permissions.includes(perm);
                  return (
                    <div
                      key={perm}
                      className={`p-2.5 rounded-lg border ${
                        granted ? 'bg-[#16A36A]/[0.06] border-[#16A36A]/25 text-[#0B1230]' : 'bg-[#F7F7FC] border-[#E4E6F0] text-[#8E95AA]'
                      }`}
                    >
                      <span className="block font-medium">{perm}</span>
                      <span className="text-[10px]">{granted ? 'Granted' : 'Restricted'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'workload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-[#E4E6F0] rounded-xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-[#0B1230]">My Supervisory Workload Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-[#F7F7FC] border border-[#E4E6F0]">
                <span className="text-[#69718A] block">Pending Approvals</span>
                <span className="text-lg font-bold text-[#7050F5] tabular-nums">{pendingApprovalsCount}</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#F7F7FC] border border-[#E4E6F0]">
                <span className="text-[#69718A] block">Active Tasks</span>
                <span className="text-lg font-bold text-[#0B1230] tabular-nums">{scopedTasks.length}</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#F7F7FC] border border-[#E4E6F0]">
                <span className="text-[#69718A] block">Team Size</span>
                <span className="text-lg font-bold text-[#16A36A] tabular-nums">{scopedEmployees.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E4E6F0] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-[#0B1230] mb-3">Recent Supervisory Audit Activity</h3>
            <ActivityTimeline
              events={auditLogs.map((a) => ({
                id: a.id,
                title: a.action,
                description: a.details,
                timestamp: a.timestamp,
                actor: a.actorName,
              }))}
            />
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
          <div className="bg-white border border-[#E4E6F0] rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#0B1230]">Security Preferences</h3>
            <div className="flex items-center justify-between py-2 border-b border-[#EEF0F7]">
              <div>
                <p className="font-semibold text-[#0B1230]">Multi-Factor Verification for Approvals</p>
                <p className="text-[#5A627A]">Require session verification on sensitive roster overrides</p>
              </div>
              <input
                type="checkbox"
                checked={mfaEnabled}
                onChange={(e) => {
                  setMfaEnabled(e.target.checked);
                  pushToast({ title: 'Security setting updated', variant: 'success' });
                }}
                className="h-4 w-4 accent-[#7050F5]"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-[#0B1230]">Urgent Approval Digest Alerts</p>
                <p className="text-[#5A627A]">Notify immediately when team coverage drops below 85%</p>
              </div>
              <input
                type="checkbox"
                checked={approvalAlerts}
                onChange={(e) => {
                  setApprovalAlerts(e.target.checked);
                  pushToast({ title: 'Notification preference updated', variant: 'success' });
                }}
                className="h-4 w-4 accent-[#7050F5]"
              />
            </div>
          </div>

          <div className="bg-white border border-[#E4E6F0] rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-[#0B1230]">Recent Login History</h3>
            <div className="divide-y divide-[#EEF0F7]">
              {[
                { time: currentManager.lastLogin, device: 'Chrome on macOS · SSO Verified', status: 'Active' },
                { time: '2026-11-13 08:19 IST · Bengaluru', device: 'Chrome on macOS · SSO Verified', status: 'Nominal' },
                { time: '2026-11-12 08:05 IST · Bengaluru', device: 'PayFuse Mobile Web · Biometric', status: 'Nominal' },
              ].map((entry) => (
                <div key={entry.time} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#0B1230] tabular-nums">{entry.time}</p>
                    <p className="text-[#5A627A]">{entry.device}</p>
                  </div>
                  <StatusBadge status={entry.status} compact />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
