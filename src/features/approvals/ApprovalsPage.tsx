import React, { useMemo, useState } from 'react';
import { Calendar, Check, Clock, Eye, History, Lock, MessageSquare, X } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { usePermissions } from '../../hooks/usePermissions';
import { LeaveRequest } from '../../types';
import { formatDateShort } from '../../utils/formatters';
import { ApprovalQueue } from '../dashboards/ApprovalQueue';

type ApprovalTab = 'leave' | 'calendar' | 'attendance-ot' | 'history';

export const ApprovalsPage: React.FC = () => {
  const {
    scopedEmployees,
    scopedLeaves,
    scopedRegularisations,
    scopedOvertime,
    scopedShiftSwaps,
    auditLogs,
    decideLeaveRequest,
    openConfirmDialog,
  } = useApp();
  const { canApprove } = usePermissions();

  const [activeTab, setActiveTab] = useState<ApprovalTab>('leave');
  const [detailLeave, setDetailLeave] = useState<LeaveRequest | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  const counts = useMemo(() => {
    const leave = scopedLeaves.filter((l) => l.status === 'Pending').length;
    const att = scopedRegularisations.filter((r) => r.status === 'Pending').length;
    const ot = scopedOvertime.filter((o) => o.status === 'Pending').length;
    const swaps = scopedShiftSwaps.filter((s) => s.status === 'Pending').length;
    return { leave, att, ot, swaps, total: leave + att + ot + swaps };
  }, [scopedLeaves, scopedRegularisations, scopedOvertime, scopedShiftSwaps]);

  const computeCoverageImpact = (leave: LeaveRequest) => {
    const teamSize = Math.max(1, scopedEmployees.filter((e) => e.teamId === leave.teamId).length);
    const overlapping = scopedLeaves.filter(
      (l) =>
        l.teamId === leave.teamId &&
        l.id !== leave.id &&
        (l.status === 'Approved' || l.status === 'Pending') &&
        l.startDate <= leave.endDate &&
        l.endDate >= leave.startDate
    ).length;
    const projectedPct = Math.round(((teamSize - 1 - overlapping) / teamSize) * 100);
    return {
      teamSize,
      overlapping,
      projectedPct,
      risk: projectedPct < 80 ? 'High Impact' : 'Safe Coverage',
    };
  };

  const leaveColumns: ColumnDef<LeaveRequest>[] = [
    {
      key: 'emp',
      header: 'Employee',
      sortValue: (r) => r.employeeName,
      render: (r) => (
        <div>
          <p className="font-semibold text-[#0B1230]">{r.employeeName}</p>
          <p className="text-[11px] text-[#69718A]">{r.departmentName}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Leave Type',
      render: (r) => <span className="text-xs font-medium text-[#0B1230]">{r.leaveType}</span>,
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (r) => (
        <span className="text-xs tabular-nums whitespace-nowrap">
          {formatDateShort(r.startDate)} – {formatDateShort(r.endDate)}
        </span>
      ),
    },
    {
      key: 'days',
      header: 'Days',
      align: 'right',
      render: (r) => <span className="font-mono text-xs font-semibold tabular-nums">{r.requestedDays}d</span>,
    },
    {
      key: 'impact',
      header: 'Team Coverage Impact',
      render: (r) => {
        const imp = computeCoverageImpact(r);
        return (
          <div className="text-xs">
            <span className={imp.projectedPct < 80 ? 'font-semibold text-[#E05252]' : 'font-semibold text-[#16A36A]'}>
              {imp.projectedPct}% available
            </span>
            <span className="block text-[11px] text-[#69718A]">{imp.overlapping} overlapping</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} compact />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setDetailLeave(r)}
            className="p-1.5 rounded-md text-[#5A627A] hover:text-[#0B1230] hover:bg-[#EEF0F7]"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {r.status === 'Pending' && canApprove && (
            <>
              <button
                type="button"
                onClick={() => decideLeaveRequest(r.id, 'Approved', 'Team coverage verified')}
                className="p-1.5 rounded-md text-[#16A36A] hover:bg-[#16A36A]/10"
                title="Approve"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  openConfirmDialog({
                    title: `Reject Leave Request ${r.id}?`,
                    message: `Rejecting ${r.employeeName}'s ${r.leaveType} request will notify the employee.`,
                    confirmLabel: 'Reject',
                    variant: 'danger',
                    onConfirm: () => decideLeaveRequest(r.id, 'Rejected', 'Peak staffing required'),
                  })
                }
                className="p-1.5 rounded-md text-[#E05252] hover:bg-[#E05252]/10"
                title="Reject"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDetailLeave(r)}
                className="p-1.5 rounded-md text-[#B97814] hover:bg-[#E9A23B]/15"
                title="Request Changes"
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Leave Calendar Dates (Nov 14 – Nov 27)
  const calendarDates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date('2026-11-14T00:00:00');
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#0B1230]">Leave & Approvals Centre</h1>
        <p className="text-xs text-[#5A627A] mt-0.5">
          Review leave impact on team coverage, attendance corrections, overtime, and shift swaps
        </p>
      </div>

      {/* 5 Approval KPI Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <KPIStatCard title="Pending Leave" primaryValue={counts.leave} breakdown={[{ label: 'Total', value: scopedLeaves.length }]} onClick={() => setActiveTab('leave')} />
        <KPIStatCard title="Attendance Corrections" primaryValue={counts.att} breakdown={[{ label: 'Regularisations', value: scopedRegularisations.length }]} onClick={() => setActiveTab('attendance-ot')} />
        <KPIStatCard title="Overtime Requests" primaryValue={counts.ot} breakdown={[{ label: 'Total', value: scopedOvertime.length }]} onClick={() => setActiveTab('attendance-ot')} />
        <KPIStatCard title="Shift Changes" primaryValue={counts.swaps} breakdown={[{ label: 'Swaps', value: scopedShiftSwaps.length }]} onClick={() => setActiveTab('attendance-ot')} />
        <KPIStatCard title="Total Pending" primaryValue={counts.total} breakdown={[{ label: 'Audited', value: auditLogs.length }]} onClick={() => setActiveTab('history')} />
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white border border-[#E4E6F0] rounded-xl w-full sm:w-fit">
        {(
          [
            ['leave', `Leave Approvals (${counts.leave})`, Check],
            ['calendar', 'Leave Calendar', Calendar],
            ['attendance-ot', 'Attendance, OT & Swaps', Clock],
            ['history', 'Approval History', History],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              activeTab === id ? 'bg-[#7050F5] text-white' : 'text-[#5A627A] hover:text-[#0B1230]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'leave' && (
        <DataTable data={scopedLeaves} columns={leaveColumns} rowKey={(r) => r.id} onRowClick={setDetailLeave} />
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white border border-[#E4E6F0] rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#0B1230]">Team Leave & Availability Calendar</h3>
              <p className="text-xs text-[#5A627A]">
                Displays approved leave, pending leave, holidays, and weekly offs without disclosing confidential medical reasons
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#5A627A]">
              <Lock className="h-3.5 w-3.5 text-[#7050F5]" />
              <span>Confidential reasons masked</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {calendarDates.map((dt) => {
              const dayObj = new Date(dt + 'T00:00:00');
              const isSunday = dayObj.getDay() === 0;
              const isHoliday = dt === '2026-11-24';
              const dayLeaves = scopedLeaves.filter((l) => l.startDate <= dt && l.endDate >= dt && l.status !== 'Rejected');

              return (
                <div
                  key={dt}
                  className={`border rounded-lg p-3 min-h-[108px] text-xs flex flex-col justify-between ${
                    isHoliday
                      ? 'bg-[#7050F5]/[0.05] border-[#7050F5]/30'
                      : isSunday
                      ? 'bg-[#F7F7FC] border-[#E4E6F0]'
                      : 'bg-white border-[#E4E6F0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0B1230] tabular-nums">
                      {dayObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="text-[11px] text-[#69718A]">
                      {dayObj.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    {isHoliday && (
                      <div className="px-1.5 py-0.5 rounded bg-[#7050F5]/10 text-[#7050F5] text-[10px] font-semibold">
                        Company Holiday
                      </div>
                    )}
                    {isSunday && !isHoliday && (
                      <div className="text-[10px] text-[#69718A]">Weekly Off</div>
                    )}
                    {dayLeaves.slice(0, 2).map((l) => (
                      <div
                        key={l.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${
                          l.status === 'Approved'
                            ? 'bg-[#16A36A]/10 text-[#16A36A]'
                            : 'bg-[#E9A23B]/15 text-[#B97814]'
                        }`}
                      >
                        {l.employeeName} · {l.status}
                      </div>
                    ))}
                    {dayLeaves.length > 2 && (
                      <div className="text-[10px] text-[#5A627A]">+{dayLeaves.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'attendance-ot' && <ApprovalQueue limit={20} />}

      {activeTab === 'history' && (
        <DataTable
          data={auditLogs}
          rowKey={(a) => a.id}
          columns={[
            { key: 'id', header: 'Audit ID', render: (a) => <span className="font-mono text-xs">{a.id}</span> },
            { key: 'action', header: 'Decision / Action', render: (a) => <span className="font-semibold text-[#0B1230]">{a.action}</span> },
            { key: 'target', header: 'Record', render: (a) => <span className="font-mono text-xs text-[#7050F5]">{a.targetId}</span> },
            { key: 'actor', header: 'Approver', render: (a) => <span className="text-xs">{a.actorName} ({a.actorRole})</span> },
            { key: 'time', header: 'Timestamp', render: (a) => <span className="text-xs tabular-nums">{a.timestamp}</span> },
            { key: 'details', header: 'Comments', render: (a) => <span className="text-xs text-[#5A627A]">{a.details}</span> },
          ]}
        />
      )}

      {/* Leave Detail Drawer with Coverage Verification */}
      <DetailDrawer
        open={Boolean(detailLeave)}
        onClose={() => {
          setDetailLeave(null);
          setDecisionNote('');
        }}
        title={detailLeave ? `Leave Request · ${detailLeave.id}` : ''}
        subtitle={detailLeave ? `${detailLeave.employeeName} · ${detailLeave.leaveType}` : ''}
      >
        {detailLeave && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#F7F7FC] border border-[#E4E6F0] rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[#5A627A]">Requested Window</span>
                <span className="font-semibold text-[#0B1230] tabular-nums">
                  {formatDateShort(detailLeave.startDate)} – {formatDateShort(detailLeave.endDate)} ({detailLeave.requestedDays} days)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5A627A]">Current Status</span>
                <StatusBadge status={detailLeave.status} compact />
              </div>
              {(() => {
                const imp = computeCoverageImpact(detailLeave);
                return (
                  <div className="pt-2 border-t border-[#E4E6F0] flex items-center justify-between">
                    <span className="text-[#5A627A]">Projected Team Availability</span>
                    <span className={imp.projectedPct < 80 ? 'font-bold text-[#E05252]' : 'font-bold text-[#16A36A]'}>
                      {imp.projectedPct}% ({imp.teamSize - 1 - imp.overlapping} of {imp.teamSize} present)
                    </span>
                  </div>
                );
              })()}
            </div>

            {detailLeave.status === 'Pending' && canApprove && (
              <>
                <div>
                  <label className="block font-semibold text-[#0B1230] mb-1.5">Decision Comments</label>
                  <textarea
                    rows={3}
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    placeholder="Add coverage instructions or requested date adjustments..."
                    className="w-full p-3 rounded-lg border border-[#E4E6F0]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      decideLeaveRequest(detailLeave.id, 'Approved', decisionNote || 'Coverage confirmed');
                      setDetailLeave(null);
                      setDecisionNote('');
                    }}
                    className="px-4 py-2 font-semibold text-white bg-[#16A36A] hover:bg-[#138A58] rounded-lg"
                  >
                    Approve Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      decideLeaveRequest(detailLeave.id, 'Changes Requested', decisionNote || 'Please stagger dates');
                      setDetailLeave(null);
                      setDecisionNote('');
                    }}
                    className="px-4 py-2 font-semibold text-[#B97814] bg-[#E9A23B]/15 rounded-lg"
                  >
                    Request Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      decideLeaveRequest(detailLeave.id, 'Rejected', decisionNote || 'Insufficient shift coverage');
                      setDetailLeave(null);
                      setDecisionNote('');
                    }}
                    className="px-4 py-2 font-semibold text-white bg-[#E05252] hover:bg-[#C94141] rounded-lg"
                  >
                    Reject
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
