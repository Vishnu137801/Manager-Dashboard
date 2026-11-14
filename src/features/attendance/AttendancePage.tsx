import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  FileText,
  Lock,
  MessageSquare,
  Timer,
  X,
} from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { AttendanceCalendar } from '../../components/ui/AttendanceCalendar';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { FilterBar } from '../../components/ui/FilterBar';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { usePermissions } from '../../hooks/usePermissions';
import { TODAY_ISO } from '../../mock-data/seedData';
import { AttendanceRecord, OvertimeRequest, RegularisationRequest } from '../../types';
import { formatDateShort } from '../../utils/formatters';

type AttTab = 'daily' | 'missing' | 'late' | 'regularisation' | 'overtime' | 'history';

export const AttendancePage: React.FC = () => {
  const {
    scopedAttendance,
    scopedRegularisations,
    scopedOvertime,
    departments,
    shifts,
    decideRegularisation,
    decideOvertimeRequest,
    pushToast,
  } = useApp();
  const { canApprove } = usePermissions();

  const [activeTab, setActiveTab] = useState<AttTab>('daily');
  const [selectedDate, setSelectedDate] = useState(TODAY_ISO);
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [reviewRecord, setReviewRecord] = useState<AttendanceRecord | null>(null);
  const [clarificationNote, setClarificationNote] = useState('');

  const todayRecords = useMemo(
    () => scopedAttendance.filter((r) => r.date === selectedDate),
    [scopedAttendance, selectedDate]
  );

  const overviewStats = useMemo(() => {
    const present = todayRecords.filter((r) => r.status === 'Present' || r.status === 'On Break').length;
    const absent = todayRecords.filter((r) => r.status === 'Absent').length;
    const onLeave = todayRecords.filter((r) => r.status === 'On Leave').length;
    const late = todayRecords.filter((r) => r.status === 'Late').length;
    const missing = todayRecords.filter((r) => r.status === 'Missing Punch').length;
    const overtime = scopedOvertime.filter((o) => o.status === 'Pending' || o.status === 'Approved').length;
    return { present, absent, onLeave, late, missing, overtime };
  }, [todayRecords, scopedOvertime]);

  const filteredDaily = useMemo(() => {
    const q = search.trim().toLowerCase();
    return todayRecords.filter((r) => {
      if (q && !r.employeeName.toLowerCase().includes(q) && !r.departmentName.toLowerCase().includes(q)) return false;
      if (shiftFilter !== 'all' && r.shiftId !== shiftFilter) return false;
      if (deptFilter !== 'all' && r.departmentName !== deptFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [todayRecords, search, shiftFilter, deptFilter, statusFilter]);

  const missingRecords = useMemo(
    () => todayRecords.filter((r) => r.status === 'Missing Punch'),
    [todayRecords]
  );

  const lateRecords = useMemo(
    () => todayRecords.filter((r) => r.status === 'Late'),
    [todayRecords]
  );

  const dailyColumns: ColumnDef<AttendanceRecord>[] = [
    {
      key: 'emp',
      header: 'Employee',
      sortValue: (r) => r.employeeName,
      render: (r) => (
        <div>
          <p className="font-semibold text-[#0B1230] whitespace-nowrap">{r.employeeName}</p>
          <p className="text-[11px] text-[#69718A]">{r.departmentName}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (r) => <span className="text-xs tabular-nums whitespace-nowrap">{formatDateShort(r.date)}</span>,
    },
    {
      key: 'shift',
      header: 'Shift',
      render: (r) => <span className="text-xs text-[#0B1230] whitespace-nowrap">{r.shiftName}</span>,
    },
    {
      key: 'in',
      header: 'Check In',
      render: (r) => <span className="font-mono text-xs tabular-nums">{r.checkIn || '—'}</span>,
    },
    {
      key: 'out',
      header: 'Check Out',
      render: (r) => <span className="font-mono text-xs tabular-nums">{r.checkOut || '—'}</span>,
    },
    {
      key: 'hours',
      header: 'Working Hrs',
      align: 'right',
      sortValue: (r) => r.workingHours,
      render: (r) => <span className="font-mono text-xs font-semibold tabular-nums">{r.workingHours.toFixed(1)}h</span>,
    },
    {
      key: 'break',
      header: 'Break',
      align: 'right',
      render: (r) => <span className="text-xs text-[#5A627A] tabular-nums">{r.breakMinutes}m</span>,
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setReviewRecord(r);
          }}
          className="px-2.5 py-1 text-xs font-semibold text-[#7050F5] hover:bg-[#7050F5]/10 rounded-md"
        >
          Review
        </button>
      ),
    },
  ];

  const regColumns: ColumnDef<RegularisationRequest>[] = [
    {
      key: 'id',
      header: 'Req ID',
      render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span>,
    },
    {
      key: 'emp',
      header: 'Employee',
      render: (r) => (
        <div>
          <p className="font-semibold text-[#0B1230]">{r.employeeName}</p>
          <p className="text-[11px] text-[#69718A]">{r.departmentName}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Attendance Date',
      render: (r) => <span className="text-xs tabular-nums">{formatDateShort(r.date)}</span>,
    },
    {
      key: 'orig',
      header: 'Original Punch',
      render: (r) => <span className="font-mono text-xs text-[#E05252]">{r.originalPunch}</span>,
    },
    {
      key: 'req',
      header: 'Requested Punch',
      render: (r) => <span className="font-mono text-xs text-[#16A36A]">{r.requestedPunch}</span>,
    },
    {
      key: 'reason',
      header: 'Reason & Proof',
      render: (r) => (
        <div className="max-w-xs">
          <p className="text-xs text-[#0B1230] truncate">{r.reason}</p>
          {r.supportingDocName && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#478BFA]">
              <FileText className="h-3 w-3" /> {r.supportingDocName}
            </span>
          )}
        </div>
      ),
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
              onClick={() => decideRegularisation(r.id, 'Approved', 'Verified against supervisor gate log')}
              className="p-1.5 rounded-md text-[#16A36A] hover:bg-[#16A36A]/10"
              title="Approve Correction"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => decideRegularisation(r.id, 'Rejected', 'Supporting terminal evidence insufficient')}
              className="p-1.5 rounded-md text-[#E05252] hover:bg-[#E05252]/10"
              title="Reject Correction"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-[#69718A]">{r.reviewedBy ? `By ${r.reviewedBy}` : '—'}</span>
        ),
    },
  ];

  const otColumns: ColumnDef<OvertimeRequest>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span>,
    },
    {
      key: 'emp',
      header: 'Employee',
      render: (r) => (
        <div>
          <p className="font-semibold text-[#0B1230]">{r.employeeName}</p>
          <p className="text-[11px] text-[#69718A]">{r.departmentName}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (r) => <span className="text-xs tabular-nums">{formatDateShort(r.date)}</span>,
    },
    {
      key: 'reg',
      header: 'Regular Hrs',
      align: 'right',
      render: (r) => <span className="font-mono text-xs tabular-nums">{r.regularHours.toFixed(1)}h</span>,
    },
    {
      key: 'ot',
      header: 'Overtime Hrs',
      align: 'right',
      render: (r) => <span className="font-mono text-xs font-semibold text-[#7050F5] tabular-nums">+{r.overtimeHours.toFixed(1)}h</span>,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (r) => <p className="text-xs text-[#0B1230] max-w-xs truncate">{r.reason}</p>,
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
              onClick={() => decideOvertimeRequest(r.id, 'Approved')}
              className="p-1.5 rounded-md text-[#16A36A] hover:bg-[#16A36A]/10"
              title="Approve Overtime"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => decideOvertimeRequest(r.id, 'Rejected')}
              className="p-1.5 rounded-md text-[#E05252] hover:bg-[#E05252]/10"
              title="Reject Overtime"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-[#69718A]">{r.reviewedBy ? `By ${r.reviewedBy}` : '—'}</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0B1230]">Attendance Management</h1>
          <p className="text-xs text-[#5A627A] mt-0.5">
            Monitor team check-ins, missing punches, late arrivals, and authorised correction requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="att-date" className="text-xs font-medium text-[#5A627A]">
            Date:
          </label>
          <input
            id="att-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 px-3 text-xs font-medium bg-white border border-[#E4E6F0] rounded-lg text-[#0B1230]"
          />
        </div>
      </div>

      {/* Policy Notice */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-[#E4E6F0] text-xs text-[#5A627A]">
        <Lock className="h-3.5 w-3.5 text-[#7050F5] shrink-0" />
        <span>
          Raw terminal punches are immutable. Managers can approve or reject attendance changes exclusively through the authorised Regularisation workflow.
        </span>
      </div>

      {/* 6 Overview Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <KPIStatCard title="Present" primaryValue={overviewStats.present} breakdown={[{ label: 'On Time', value: overviewStats.present, tone: 'success' }]} />
        <KPIStatCard title="Absent" primaryValue={overviewStats.absent} breakdown={[{ label: 'Unplanned', value: overviewStats.absent, tone: overviewStats.absent > 0 ? 'error' : 'default' }]} />
        <KPIStatCard title="On Leave" primaryValue={overviewStats.onLeave} breakdown={[{ label: 'Approved', value: overviewStats.onLeave }]} />
        <KPIStatCard title="Late Arrivals" primaryValue={overviewStats.late} breakdown={[{ label: 'Flagged', value: overviewStats.late, tone: 'warning' }]} onClick={() => setActiveTab('late')} />
        <KPIStatCard title="Missing Punch" primaryValue={overviewStats.missing} breakdown={[{ label: 'Pending Reg.', value: overviewStats.missing, tone: overviewStats.missing > 0 ? 'error' : 'default' }]} onClick={() => setActiveTab('missing')} />
        <KPIStatCard title="Overtime" primaryValue={overviewStats.overtime} breakdown={[{ label: 'Requests', value: scopedOvertime.length }]} onClick={() => setActiveTab('overtime')} />
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white border border-[#E4E6F0] rounded-xl w-full sm:w-fit">
        {(
          [
            ['daily', 'Daily Attendance', Clock],
            ['missing', `Missing Punches (${missingRecords.length})`, AlertCircle],
            ['late', `Late Arrivals (${lateRecords.length})`, Timer],
            ['regularisation', `Regularisation (${scopedRegularisations.filter((r) => r.status === 'Pending').length})`, Check],
            ['overtime', `Overtime (${scopedOvertime.filter((o) => o.status === 'Pending').length})`, Timer],
            ['history', 'Attendance History', Calendar],
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

      {activeTab === 'daily' && (
        <div className="space-y-4">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search employee or department..."
            selects={[
              {
                key: 'shift',
                label: 'Shift',
                value: shiftFilter,
                onChange: setShiftFilter,
                options: shifts.map((s) => ({ label: s.name, value: s.id })),
              },
              {
                key: 'dept',
                label: 'Department',
                value: deptFilter,
                onChange: setDeptFilter,
                options: departments.map((d) => ({ label: d.name, value: d.name })),
              },
              {
                key: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: ['Present', 'Late', 'On Leave', 'Absent', 'Missing Punch', 'On Break', 'Not Scheduled'].map(
                  (s) => ({ label: s, value: s })
                ),
              },
            ]}
            onReset={() => {
              setSearch('');
              setShiftFilter('all');
              setDeptFilter('all');
              setStatusFilter('all');
            }}
          />
          <DataTable data={filteredDaily} columns={dailyColumns} rowKey={(r) => r.id} onRowClick={setReviewRecord} />
        </div>
      )}

      {activeTab === 'missing' && (
        <DataTable
          data={missingRecords}
          columns={dailyColumns}
          rowKey={(r) => r.id}
          onRowClick={setReviewRecord}
          emptyTitle="No missing punches for selected date"
          emptyDescription="All scheduled employees have complete terminal punch pairs."
        />
      )}

      {activeTab === 'late' && (
        <DataTable
          data={lateRecords}
          rowKey={(r) => r.id}
          columns={[
            {
              key: 'emp',
              header: 'Employee',
              render: (r) => <span className="font-semibold text-[#0B1230]">{r.employeeName}</span>,
            },
            {
              key: 'start',
              header: 'Shift Start',
              render: (r) => <span className="font-mono text-xs tabular-nums">{r.shiftStart}</span>,
            },
            {
              key: 'actual',
              header: 'Actual Check-in',
              render: (r) => <span className="font-mono text-xs text-[#B97814] font-semibold tabular-nums">{r.checkIn || '—'}</span>,
            },
            {
              key: 'delay',
              header: 'Delay',
              align: 'right',
              render: (r) => <span className="font-mono text-xs font-semibold text-[#E05252] tabular-nums">+{r.lateMinutes || 15} min</span>,
            },
            {
              key: 'reason',
              header: 'Reason',
              render: (r) => <span className="text-xs text-[#5A627A]">{r.notes || 'Transit delay'}</span>,
            },
            {
              key: 'prev',
              header: '30d Occurrences',
              align: 'right',
              render: (r) => (
                <span className="text-xs font-semibold tabular-nums">
                  {scopedAttendance.filter((a) => a.employeeId === r.employeeId && a.status === 'Late').length}
                </span>
              ),
            },
          ]}
        />
      )}

      {activeTab === 'regularisation' && (
        <DataTable data={scopedRegularisations} columns={regColumns} rowKey={(r) => r.id} />
      )}

      {activeTab === 'overtime' && (
        <DataTable data={scopedOvertime} columns={otColumns} rowKey={(r) => r.id} />
      )}

      {activeTab === 'history' && <AttendanceCalendar records={scopedAttendance} />}

      {/* Review Drawer */}
      <DetailDrawer
        open={Boolean(reviewRecord)}
        onClose={() => {
          setReviewRecord(null);
          setClarificationNote('');
        }}
        title={reviewRecord ? `Attendance Record · ${reviewRecord.employeeName}` : ''}
        subtitle={reviewRecord ? `${formatDateShort(reviewRecord.date)} · ${reviewRecord.shiftName}` : ''}
      >
        {reviewRecord && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#F7F7FC] border border-[#E4E6F0] rounded-xl p-4 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#69718A] block">Check In</span>
                <span className="font-mono font-semibold text-[#0B1230]">{reviewRecord.checkIn || 'Missing'}</span>
              </div>
              <div>
                <span className="text-[#69718A] block">Check Out</span>
                <span className="font-mono font-semibold text-[#0B1230]">{reviewRecord.checkOut || 'Missing'}</span>
              </div>
              <div>
                <span className="text-[#69718A] block">Working Hours</span>
                <span className="font-semibold tabular-nums">{reviewRecord.workingHours.toFixed(1)} hrs</span>
              </div>
              <div>
                <span className="text-[#69718A] block">Current Status</span>
                <StatusBadge status={reviewRecord.status} compact />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#0B1230] mb-1.5">
                Request Clarification from Employee
              </label>
              <textarea
                rows={3}
                value={clarificationNote}
                onChange={(e) => setClarificationNote(e.target.value)}
                placeholder="Ask employee to submit a regularisation slip or confirm punch discrepancy..."
                className="w-full p-3 rounded-lg border border-[#E4E6F0] text-[#0B1230] focus:outline-none focus:border-[#7050F5]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  pushToast({
                    title: `Clarification requested from ${reviewRecord.employeeName}`,
                    description: clarificationNote || 'Employee notified to submit regularisation details.',
                    variant: 'info',
                  });
                  setReviewRecord(null);
                  setClarificationNote('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Send Clarification Request</span>
              </button>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
