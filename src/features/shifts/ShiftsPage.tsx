import React, { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  CalendarClock,
  Check,
  Coffee,
  FilePlus2,
  Paperclip,
  Plus,
  X,
} from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { usePermissions } from '../../hooks/usePermissions';
import { TODAY_ISO } from '../../mock-data/seedData';
import { ShiftAssignment, ShiftSwapRequest } from '../../types';
import { formatDateShort } from '../../utils/formatters';
import { ShiftAssignmentModal } from './ShiftAssignmentModal';
import { ShiftCalendar } from './ShiftCalendar';

type ShiftTab = 'calendar' | 'roster' | 'swaps' | 'breaks' | 'handover';

export const ShiftsPage: React.FC = () => {
  const {
    currentManager,
    scopedEmployees,
    scopedShiftAssignments,
    scopedShiftSwaps,
    handoverLogs,
    shifts,
    branches,
    decideShiftSwap,
    addHandoverLog,
  } = useApp();
  const { canApprove, canManageShifts } = usePermissions();

  const [activeTab, setActiveTab] = useState<ShiftTab>('calendar');
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Handover Form state
  const [handoverShift, setHandoverShift] = useState('Morning Shift -> Evening Shift');
  const [incomingSup, setIncomingSup] = useState('David Chen');
  const [handoverBranch, setHandoverBranch] = useState(branches[0]?.id || 'br-blr');
  const [pendingWork, setPendingWork] = useState('');
  const [incidentsNote, setIncidentsNote] = useState('');
  const [importantNotes, setImportantNotes] = useState('');
  const [outstandingCount, setOutstandingCount] = useState(2);
  const [attachmentName, setAttachmentName] = useState('');

  const metrics = useMemo(() => {
    const totalShifts = shifts.length;
    const scheduled = scopedShiftAssignments.length;
    const understaffed = shifts.filter((sh) => {
      const assigned = scopedEmployees.filter((e) => e.shiftId === sh.id).length;
      return assigned > 0 && assigned < Math.ceil(scopedEmployees.length * 0.22);
    }).length;
    const swapRequests = scopedShiftSwaps.filter((s) => s.status === 'Pending').length;
    const openPositions = Math.max(0, Math.round(scopedEmployees.length * 0.08));
    return { totalShifts, scheduled, understaffed, swapRequests, openPositions };
  }, [shifts, scopedShiftAssignments, scopedEmployees, scopedShiftSwaps]);

  const rosterColumns: ColumnDef<ShiftAssignment>[] = [
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
      key: 'shift',
      header: 'Shift',
      render: (r) => <span className="font-medium text-[#7050F5] text-xs">{r.shiftName}</span>,
    },
    {
      key: 'time',
      header: 'Timings',
      render: (r) => <span className="font-mono text-xs tabular-nums">{r.startTime} – {r.endTime}</span>,
    },
    {
      key: 'break',
      header: 'Break',
      align: 'right',
      render: (r) => <span className="text-xs tabular-nums">{r.breakDuration} min</span>,
    },
    {
      key: 'off',
      header: 'Weekly Off',
      render: (r) => <span className="text-xs text-[#5A627A]">{r.weeklyOff}</span>,
    },
    {
      key: 'loc',
      header: 'Location',
      render: (r) => <span className="text-xs text-[#0B1230]">{r.location}</span>,
    },
  ];

  const swapColumns: ColumnDef<ShiftSwapRequest>[] = [
    {
      key: 'id',
      header: 'Req ID',
      render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span>,
    },
    {
      key: 'emp',
      header: 'Employee',
      render: (r) => <span className="font-semibold text-[#0B1230]">{r.employeeName}</span>,
    },
    {
      key: 'cur',
      header: 'Current Shift',
      render: (r) => <span className="text-xs text-[#5A627A]">{r.currentShift}</span>,
    },
    {
      key: 'req',
      header: 'Requested Shift',
      render: (r) => <span className="text-xs font-medium text-[#7050F5]">{r.requestedShift}</span>,
    },
    {
      key: 'with',
      header: 'Swap With',
      render: (r) => <span className="text-xs font-medium text-[#0B1230]">{r.swapWithName}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (r) => <span className="text-xs tabular-nums">{formatDateShort(r.date)}</span>,
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
      render: (r) =>
        r.status === 'Pending' && canApprove ? (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => decideShiftSwap(r.id, 'Approved')}
              className="p-1.5 rounded-md text-[#16A36A] hover:bg-[#16A36A]/10"
              title="Approve Swap"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => decideShiftSwap(r.id, 'Rejected')}
              className="p-1.5 rounded-md text-[#E05252] hover:bg-[#E05252]/10"
              title="Reject Swap"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-[#69718A]">{r.reviewedBy ? `By ${r.reviewedBy}` : '—'}</span>
        ),
    },
  ];

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingWork.trim()) return;
    addHandoverLog({
      shiftName: handoverShift,
      date: TODAY_ISO,
      outgoingSupervisor: currentManager.name,
      incomingSupervisor: incomingSup,
      branchId: handoverBranch,
      pendingWork: pendingWork.trim(),
      incidents: incidentsNote.trim() || 'None reported.',
      importantNotes: importantNotes.trim() || 'Standard shift continuity.',
      outstandingTasksCount: outstandingCount,
      attachmentName: attachmentName || undefined,
    });
    setPendingWork('');
    setIncidentsNote('');
    setImportantNotes('');
    setAttachmentName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0B1230]">Shift Management</h1>
          <p className="text-xs text-[#5A627A] mt-0.5">
            Schedule rosters, balance shift coverage, approve swaps, and record shift handovers
          </p>
        </div>
        {canManageShifts && (
          <button
            type="button"
            onClick={() => setAssignModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Assign Shift</span>
          </button>
        )}
      </div>

      {/* 5 Shift KPI Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <KPIStatCard title="Active Shifts" primaryValue={metrics.totalShifts} breakdown={[{ label: 'Templates', value: 'Configured' }]} />
        <KPIStatCard title="Employees Scheduled" primaryValue={metrics.scheduled} breakdown={[{ label: 'Scope', value: scopedEmployees.length }]} />
        <KPIStatCard
          title="Understaffed Shifts"
          primaryValue={metrics.understaffed}
          breakdown={[{ label: 'Alert', value: metrics.understaffed > 0 ? 'Needs Cover' : 'Nominal', tone: metrics.understaffed > 0 ? 'warning' : 'success' }]}
        />
        <KPIStatCard
          title="Shift Swap Requests"
          primaryValue={metrics.swapRequests}
          breakdown={[{ label: 'Total', value: scopedShiftSwaps.length }]}
          onClick={() => setActiveTab('swaps')}
        />
        <KPIStatCard title="Open Shift Positions" primaryValue={metrics.openPositions} breakdown={[{ label: 'Unfilled', value: metrics.openPositions }]} />
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white border border-[#E4E6F0] rounded-xl w-full sm:w-fit">
        {(
          [
            ['calendar', 'Shift Calendar', CalendarClock],
            ['roster', 'Shift Roster', CalendarClock],
            ['swaps', `Shift Swapping (${metrics.swapRequests})`, ArrowLeftRight],
            ['breaks', 'Break Management', Coffee],
            ['handover', 'Shift Handover', FilePlus2],
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

      {activeTab === 'calendar' && <ShiftCalendar assignments={scopedShiftAssignments} shifts={shifts} />}

      {activeTab === 'roster' && (
        <DataTable data={scopedShiftAssignments} columns={rosterColumns} rowKey={(r) => r.id} pageSize={10} />
      )}

      {activeTab === 'swaps' && (
        <DataTable data={scopedShiftSwaps} columns={swapColumns} rowKey={(r) => r.id} />
      )}

      {activeTab === 'breaks' && (
        <DataTable
          data={scopedEmployees}
          rowKey={(e) => e.id}
          columns={[
            {
              key: 'emp',
              header: 'Employee',
              render: (e) => (
                <div>
                  <p className="font-semibold text-[#0B1230]">{e.name}</p>
                  <p className="text-[11px] text-[#69718A]">{e.teamName}</p>
                </div>
              ),
            },
            {
              key: 'shift',
              header: 'Shift',
              render: (e) => <span className="text-xs">{e.shiftName}</span>,
            },
            {
              key: 'sched',
              header: 'Scheduled Break',
              render: (e) => <span className="font-mono text-xs tabular-nums">{e.scheduledBreak || '13:00 – 13:45'}</span>,
            },
            {
              key: 'actual',
              header: 'Actual Break',
              render: (e) => <span className="font-mono text-xs tabular-nums">{e.actualBreak || '—'}</span>,
            },
            {
              key: 'status',
              header: 'Break Status',
              render: (e) => <StatusBadge status={e.breakStatus || 'Scheduled'} compact />,
            },
          ]}
        />
      )}

      {activeTab === 'handover' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <form onSubmit={handleHandoverSubmit} className="bg-white border border-[#E4E6F0] rounded-xl p-5 space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-semibold text-[#0B1230]">Record Shift Handover</h3>
              <p className="text-xs text-[#5A627A]">Log pending work, incidents, and continuity notes for the incoming supervisor</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#0B1230] mb-1">Shift Transition</label>
                <select
                  value={handoverShift}
                  onChange={(e) => setHandoverShift(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white"
                >
                  <option>Night Shift -&gt; Morning Shift</option>
                  <option>Morning Shift -&gt; Evening Shift</option>
                  <option>Evening Shift -&gt; Night Shift</option>
                  <option>General Shift Handover</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#0B1230] mb-1">Incoming Supervisor</label>
                <input
                  type="text"
                  required
                  value={incomingSup}
                  onChange={(e) => setIncomingSup(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#0B1230] mb-1">Branch / Location</label>
                <select
                  value={handoverBranch}
                  onChange={(e) => setHandoverBranch(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#0B1230] mb-1">Outstanding Tasks</label>
                <input
                  type="number"
                  min={0}
                  value={outstandingCount}
                  onChange={(e) => setOutstandingCount(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Pending Work</label>
              <textarea
                rows={2}
                required
                value={pendingWork}
                onChange={(e) => setPendingWork(e.target.value)}
                placeholder="Tasks or handoffs requiring immediate follow-up..."
                className="w-full p-3 rounded-lg border border-[#E4E6F0]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Incidents Observed</label>
              <textarea
                rows={2}
                value={incidentsNote}
                onChange={(e) => setIncidentsNote(e.target.value)}
                placeholder="Equipment, terminal, or operational observations..."
                className="w-full p-3 rounded-lg border border-[#E4E6F0]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Important Notes & Supporting File</label>
              <input
                type="text"
                value={importantNotes}
                onChange={(e) => setImportantNotes(e.target.value)}
                placeholder="Special instructions for incoming shift..."
                className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] mb-2"
              />
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E4E6F0] bg-[#F7F7FC] cursor-pointer text-[#5A627A] hover:text-[#0B1230]">
                <Paperclip className="h-3.5 w-3.5" />
                <span>{attachmentName || 'Attach supporting checklist (optional)'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setAttachmentName(e.target.files?.[0]?.name || '')}
                />
              </label>
            </div>

            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg"
            >
              Submit Shift Handover
            </button>
          </form>

          <div className="bg-white border border-[#E4E6F0] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#0B1230]">Recent Shift Handover Logs</h3>
            <div className="divide-y divide-[#EEF0F7] text-xs">
              {handoverLogs.map((log) => (
                <div key={log.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#0B1230]">
                      {log.id} · {log.shiftName}
                    </span>
                    <span className="text-[11px] text-[#69718A] tabular-nums">{log.createdAt}</span>
                  </div>
                  <p className="text-[#5A627A]">
                    Outgoing: <span className="font-medium text-[#0B1230]">{log.outgoingSupervisor}</span> · Incoming:{' '}
                    <span className="font-medium text-[#0B1230]">{log.incomingSupervisor}</span>
                  </p>
                  <p className="text-[#0B1230]">{log.pendingWork}</p>
                  <p className="text-[#5A627A]">Incidents: {log.incidents}</p>
                  {log.attachmentName && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#478BFA]">
                      <Paperclip className="h-3 w-3" /> {log.attachmentName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ShiftAssignmentModal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} />
    </div>
  );
};
